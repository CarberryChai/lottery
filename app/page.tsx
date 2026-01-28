import { LotteryChecker } from '@/components/lottery-checker';
import superLottoData from '@/data/super_lotto_data.json';
import ssqData from '@/data/lottery_data.json';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          彩票历史中奖查询
        </h1>
        <LotteryChecker superLottoData={superLottoData} ssqData={ssqData} />
      </div>
    </div>
  );
}
