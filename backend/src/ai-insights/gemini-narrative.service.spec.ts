import { FinancialAnalysisService } from './financial-analysis.service';
import { FinancialInsightService } from './financial-insight.service';
import {
  GeminiNarrativeInput,
  GeminiNarrativeService,
} from './gemini-narrative.service';

describe('GeminiNarrativeService', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  let input: GeminiNarrativeInput;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    const calculator = new FinancialAnalysisService();
    const insightService = new FinancialInsightService();
    const analysis = calculator.analyze({
      allocatedBudget: 100000,
      transactions: [{ amount: 92000, type: 'EXPENSE', status: 'APPROVED' }],
    });

    input = {
      event: { id: 'event-1', name: 'Tech Symposium', status: 'APPROVED' },
      analysis,
      insights: insightService.generate(analysis),
    };
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  });

  it('returns a deterministic fallback when Gemini is not configured', async () => {
    const service = new GeminiNarrativeService();

    await expect(service.generate(input)).resolves.toEqual(
      expect.objectContaining({
        source: 'deterministic-fallback',
        riskLevel: 'HIGH',
        summary: expect.stringContaining('92%'),
        keyFindings: expect.arrayContaining([expect.stringContaining('90%')]),
      }),
    );
  });

  it('returns a validated Gemini narrative while keeping risk deterministic', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const service = new GeminiNarrativeService();
    const createInteraction = jest.fn().mockResolvedValue({
      output_text: JSON.stringify({
        summary: 'Spending is approaching the approved event budget.',
        keyFindings: ['Budget utilization is 92%.'],
        recommendations: ['Review remaining planned expenses.'],
      }),
    });
    (
      service as unknown as {
        client: {
          interactions: { create: typeof createInteraction };
        };
      }
    ).client = { interactions: { create: createInteraction } };

    const result = await service.generate(input);

    expect(result).toEqual(
      expect.objectContaining({
        source: 'gemini',
        riskLevel: 'HIGH',
        summary: 'Spending is approaching the approved event budget.',
      }),
    );
    expect(createInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        response_format: expect.objectContaining({
          mime_type: 'application/json',
          schema: expect.any(Object),
        }),
      }),
      expect.objectContaining({ timeout_ms: expect.any(Number) }),
    );
  });

  it('falls back when Gemini returns data rejected by Zod', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const service = new GeminiNarrativeService();
    const createInteraction = jest.fn().mockResolvedValue({
      output_text: JSON.stringify({
        summary: '',
        keyFindings: [],
        recommendations: [],
      }),
    });
    (
      service as unknown as {
        client: {
          interactions: { create: typeof createInteraction };
        };
      }
    ).client = { interactions: { create: createInteraction } };

    await expect(service.generate(input)).resolves.toEqual(
      expect.objectContaining({ source: 'deterministic-fallback' }),
    );
  });
});
