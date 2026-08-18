import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImageToWebP } from '../image-compressor';

describe('imageCompressor', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement toDataURL and getContext
    const mockContext = {
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(mockContext),
          toDataURL: vi.fn().mockReturnValue('data:image/webp;base64,mockWebpData'),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });
  });

  it('compresses an image file to WebP data url', async () => {
    // Mock FileReader
    class MockFileReader {
      onload: ((e: { target: { result: string } }) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mockRawData' } });
          }
        }, 10);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    // Mock Image
    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const mockBlob = new Blob(['mock content'], { type: 'image/png' });
    const result = await compressImageToWebP(mockBlob, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8,
    });

    expect(result).toBe('data:image/webp;base64,mockWebpData');
  });
});
