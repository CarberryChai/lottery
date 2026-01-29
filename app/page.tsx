import { LotteryChecker } from "@/components/lottery-checker";
import superLottoData from "@/data/super_lotto_data.json";
import ssqData from "@/data/lottery_data.json";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 多层渐变背景 - 暖白奶油色调 */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-rose-50/60" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-100/30 via-transparent to-transparent" />

      {/* 装饰性浮动光晕 */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-amber-200/40 to-orange-200/30 rounded-full blur-[100px] animate-float" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-gradient-to-br from-rose-200/35 to-pink-200/25 rounded-full blur-[120px] animate-float-delayed" />
      <div className="fixed top-[35%] right-[15%] w-[350px] h-[350px] bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full blur-[80px] animate-float-slow" />
      <div className="fixed top-[60%] left-[10%] w-[280px] h-[280px] bg-gradient-to-br from-yellow-200/25 to-amber-200/15 rounded-full blur-[90px] animate-pulse-glow" />

      {/* 微妙的网格纹理 */}
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* 内容区 */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 标题区 */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-light text-stone-800 tracking-tight mb-3">
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent font-medium">
                彩票历史
              </span>
              <span className="text-stone-600">中奖查询</span>
            </h1>
            <p className="text-stone-500 text-sm tracking-wide">
              探索您的号码在历史开奖中的表现
            </p>
          </div>

          <LotteryChecker superLottoData={superLottoData} ssqData={ssqData} />

          {/* 底部装饰 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
              <span>数据来源于官方开奖记录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
