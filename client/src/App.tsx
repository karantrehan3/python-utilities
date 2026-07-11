import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { WelcomePage } from './components/layout/WelcomePage';
import { UnlockPdf } from './components/pdf/UnlockPdf';
import { PdfInfo } from './components/pdf/PdfInfo';
import { PdfSubset } from './components/pdf/PdfSubset';
import { MergePdf } from './components/pdf/MergePdf';
import { ImagesToPdf } from './components/pdf/ImagesToPdf';
import { CompressPdf } from './components/pdf/CompressPdf';
import { ResizeImage } from './components/image/ResizeImage';
import { ConvertImage } from './components/image/ConvertImage';
import { ImageInfo } from './components/image/ImageInfo';
import { HashText } from './components/text/HashText';
import { EncodeText } from './components/text/EncodeText';
import { DecodeText } from './components/text/DecodeText';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<WelcomePage />} />

        <Route path="pdf/unlock" element={<UnlockPdf />} />
        <Route path="pdf/info" element={<PdfInfo />} />
        <Route path="pdf/subset" element={<PdfSubset />} />
        <Route path="pdf/merge" element={<MergePdf />} />
        <Route path="pdf/from-images" element={<ImagesToPdf />} />
        <Route path="pdf/compress" element={<CompressPdf />} />

        <Route path="image/resize" element={<ResizeImage />} />
        <Route path="image/convert" element={<ConvertImage />} />
        <Route path="image/info" element={<ImageInfo />} />

        <Route path="text/hash" element={<HashText />} />
        <Route path="text/encode" element={<EncodeText />} />
        <Route path="text/decode" element={<DecodeText />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
