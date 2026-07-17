export default function Header() {
  return (
    <header>
      <div className="bg-armac-blueDarker text-white text-xs sm:text-sm">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="font-semibold tracking-wide">0800 100 2511</span>
          <span className="hidden sm:inline text-white/70">armac.com.br</span>
        </div>
      </div>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-armac-blue flex items-center justify-center text-white font-extrabold text-lg">
            a
          </div>
          <div>
            <p className="text-armac-blue font-extrabold text-xl leading-none">armac</p>
            <p className="text-armac-green text-xs font-semibold tracking-wide">
              TRABALHE CONOSCO
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
