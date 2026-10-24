import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import {
  BudgetHealthStatus,
  FinancialAnalysisResult,
  FinancialInsight,
} from './interfaces/financial-analysis.interface';
import {
  GeminiNarrativeResponseJsonSchema,
  GeminiNarrativeResponseSchema,
} from './schemas/gemini-narrative.schema';

export type AiRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GeminiNarrativeInput {
  event: {
    id: string;
    name: string;
    status: string;
  };
  analysis: FinancialAnalysisResult;
  insights: FinancialInsight[];
}

export interface AiFinancialNarrative {
  source: 'gemini' | 'deterministic-fallback';
  model?: string;
  summary: string;
  riskLevel: AiRiskLevel;
  keyFindings: string[];
  recommendations: string[];
  disclaimer: string;
}

@Injectable()
export class GeminiNarrativeService {
  private readonly logger = new Logger(GeminiNarrativeService.name);
  private readonly client: GoogleGenAI | null;
  private readonly model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  private readonly timeoutMs = this.readTimeout();
  private readonly disclaimer =
    'AI-generated guidance based on recorded FinFlow data; review before making financial decisions.';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async generate(input: GeminiNarrativeInput): Promise<AiFinancialNarrative> {
    if (!this.client) {
      return this.createFallback(input);
    }

    try {
      const response = await this.client.interactions.create(
        {
          model: this.model,
          input: this.buildPrompt(input),
          system_instruction:
            'You are a cautious financial-analysis assistant. Use only the supplied verified data. Never invent, recalculate, or alter amounts, percentages, statuses, or risks. Do not claim audit assurance. Keep the response concise and actionable.',
          generation_config: {
            temperature: 0.2,
            max_output_tokens: 2000,
            thinking_level: 'low',
          },
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: GeminiNarrativeResponseJsonSchema,
          },
          store: false,
        },
        { timeout_ms: this.timeoutMs },
      );

      if (!response.output_text) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = GeminiNarrativeResponseSchema.parse(
        JSON.parse(response.output_text),
      );

      return {
        source: 'gemini',
        model: this.model,
        ...parsed,
        riskLevel: this.mapRiskLevel(input.analysis.budgetStatus),
        disclaimer: this.disclaimer,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Gemini narrative generation failed: ${message}`);
      return this.createFallback(input);
    }
  }

  private buildPrompt(input: GeminiNarrativeInput): string {
    const groundedData = {
      event: {
        name: input.event.name,
        status: input.event.status,
      },
      metrics: input.analysis.metrics,
      budgetStatus: input.analysis.budgetStatus,
      categories: input.analysis.categoryBreakdown,
      verifiedInsights: input.insights,
    };

    return [
      'Create an executive financial narrative from the verified JSON below.',
      'Use the metrics exactly as provided. Focus on the most important risks and actions.',
      'Do not introduce transactions, causes, forecasts, or amounts that are not present.',
      JSON.stringify(groundedData),
    ].join('\n');
  }

  private createFallback(input: GeminiNarrativeInput): AiFinancialNarrative {
    const { metrics } = input.analysis;
    const findings = input.insights.slice(0, 5).map((item) => item.message);
    const recommendations = Array.from(
      new Set(input.insights.map((item) => item.recommendation)),
    ).slice(0, 5);

    return {
      source: 'deterministic-fallback',
      summary: `${input.event.name} is ${input.analysis.budgetStatus.toLowerCase().replace('_', ' ')} with ${metrics.utilizationPercentage}% of its budget utilized. Approved expenses total ${metrics.approvedExpenses}, with ${metrics.pendingExpenses} still pending.`,
      riskLevel: this.mapRiskLevel(input.analysis.budgetStatus),
      keyFindings:
        findings.length > 0
          ? findings
          : [
              'No material budget risks were identified from the recorded data.',
            ],
      recommendations:
        recommendations.length > 0
          ? recommendations
          : ['Continue monitoring approved and pending transactions.'],
      disclaimer: this.disclaimer,
    };
  }

  private mapRiskLevel(status: BudgetHealthStatus): AiRiskLevel {
    switch (status) {
      case 'SAFE':
        return 'LOW';
      case 'NO_BUDGET':
      case 'WATCH':
        return 'MEDIUM';
      case 'WARNING':
        return 'HIGH';
      case 'AT_LIMIT':
      case 'OVER_BUDGET':
        return 'CRITICAL';
    }
  }

  private readTimeout(): number {
    const configured = Number(process.env.GEMINI_TIMEOUT_MS || 10000);
    return Number.isFinite(configured) && configured > 0 ? configured : 10000;
  }
}
