import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { WelcomePage } from './components/layout/WelcomePage';

import { UnlockPdf } from './components/pdf/UnlockPdf';
import { ProtectPdf } from './components/pdf/ProtectPdf';
import { PdfInfo } from './components/pdf/PdfInfo';
import { PdfSubset } from './components/pdf/PdfSubset';
import { SplitPdf } from './components/pdf/SplitPdf';
import { MergePdf } from './components/pdf/MergePdf';
import { RotatePdf } from './components/pdf/RotatePdf';
import { WatermarkPdf } from './components/pdf/WatermarkPdf';
import { PageNumbersPdf } from './components/pdf/PageNumbersPdf';
import { ImagesToPdf } from './components/pdf/ImagesToPdf';
import { PdfToImages } from './components/pdf/PdfToImages';
import { CompressPdf } from './components/pdf/CompressPdf';

import { ResizeImage } from './components/image/ResizeImage';
import { CropImage } from './components/image/CropImage';
import { RotateImage } from './components/image/RotateImage';
import { ConvertImage } from './components/image/ConvertImage';
import { CompressImage } from './components/image/CompressImage';
import { AdjustImage } from './components/image/AdjustImage';
import { ImageInfo } from './components/image/ImageInfo';

import { HashText } from './components/text/HashText';
import { EncodeText } from './components/text/EncodeText';
import { DecodeText } from './components/text/DecodeText';
import { DiffText } from './components/text/DiffText';
import { RegexTester } from './components/text/RegexTester';
import { JsonFormat } from './components/text/JsonFormat';
import { JsonMinify } from './components/text/JsonMinify';
import { CsvJson } from './components/text/CsvJson';
import { GenerateText } from './components/text/GenerateText';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<WelcomePage />} />

        <Route path="pdf/unlock" element={<UnlockPdf />} />
        <Route path="pdf/protect" element={<ProtectPdf />} />
        <Route path="pdf/info" element={<PdfInfo />} />
        <Route path="pdf/subset" element={<PdfSubset />} />
        <Route path="pdf/split" element={<SplitPdf />} />
        <Route path="pdf/merge" element={<MergePdf />} />
        <Route path="pdf/rotate" element={<RotatePdf />} />
        <Route path="pdf/watermark" element={<WatermarkPdf />} />
        <Route path="pdf/page-numbers" element={<PageNumbersPdf />} />
        <Route path="pdf/from-images" element={<ImagesToPdf />} />
        <Route path="pdf/to-images" element={<PdfToImages />} />
        <Route path="pdf/compress" element={<CompressPdf />} />

        <Route path="image/resize" element={<ResizeImage />} />
        <Route path="image/crop" element={<CropImage />} />
        <Route path="image/rotate" element={<RotateImage />} />
        <Route path="image/convert" element={<ConvertImage />} />
        <Route path="image/compress" element={<CompressImage />} />
        <Route path="image/adjust" element={<AdjustImage />} />
        <Route path="image/info" element={<ImageInfo />} />

        <Route path="text/hash" element={<HashText />} />
        <Route path="text/encode" element={<EncodeText />} />
        <Route path="text/decode" element={<DecodeText />} />
        <Route path="text/diff" element={<DiffText />} />
        <Route path="text/regex" element={<RegexTester />} />
        <Route path="text/json-format" element={<JsonFormat />} />
        <Route path="text/json-minify" element={<JsonMinify />} />
        <Route path="text/csv-json" element={<CsvJson />} />
        <Route path="text/generate" element={<GenerateText />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
