import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeBox() {
  const url = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className="shrink-0 bg-white p-2 rounded-lg border border-slate-100">
        <QRCodeSVG value={url} size={84} fgColor="#001452" level="M" />
      </div>
      <div>
        <p className="font-semibold text-armac-blueDarker text-sm">
          Prefere pelo celular?
        </p>
        <p className="text-slate-500 text-sm">
          Aponte a câmera para este QR Code e candidate-se de onde estiver.
        </p>
      </div>
    </div>
  )
}
