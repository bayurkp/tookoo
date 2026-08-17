import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sounds } from '../audio';

describe('SoundEffects', () => {
  beforeEach(() => {
    // Mock AudioContext
    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockAudioContext = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
    }));

    (window as unknown as { AudioContext: unknown }).AudioContext = mockAudioContext;
  });

  it('plays beep sound without crashing', () => {
    expect(() => sounds.playBeep()).not.toThrow();
  });

  it('plays success chime without crashing', () => {
    expect(() => sounds.playSuccess()).not.toThrow();
  });
});
