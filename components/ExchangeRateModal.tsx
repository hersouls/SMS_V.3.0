import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useApp } from '../App';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { settings, updateSettings } = useApp();
  const [newRate, setNewRate] = useState(settings.exchangeRate.toString());
  const [isLoading, setIsLoading] = useState(false);
  const realTimeRate = 1298; // Mock real-time rate

  const handleSave = async () => {
    const rate = parseFloat(newRate);
    if (rate > 0) {
      setIsLoading(true);
      try {
        await updateSettings({ exchangeRate: rate });
        onClose();
      } catch (error) {
        console.error('Error updating exchange rate:', error);
        alert('환율 저장에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setNewRate(settings.exchangeRate.toString());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-default border-white/20">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white-force text-xl-ko font-semibold tracking-ko-normal break-keep-ko">
            환율 설정
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover-button touch-target-sm focus-ring"
            aria-label="모달 닫기"
          >
            <X size={16} className="icon-enhanced" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label 
              htmlFor="exchange-rate" 
              className="text-base-ko font-medium text-white-force tracking-ko-normal break-keep-ko"
            >
              USD → KRW 환율
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-base-ko text-white-force tracking-ko-normal">1 USD =</span>
              <Input
                id="exchange-rate"
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="glass-light border-white/30 text-base-ko text-white-force tracking-ko-normal focus-ring"
                aria-describedby="exchange-rate-help"
              />
              <span className="text-base-ko text-white-force tracking-ko-normal">KRW</span>
            </div>
          </div>

          <div className="text-sm-ko text-white/70 tracking-ko-normal break-keep-ko" id="exchange-rate-help">
            실시간 환율: {realTimeRate.toLocaleString()} KRW
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="flex-1 hover-button touch-target text-base-ko font-medium tracking-ko-normal focus-ring" 
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 hover-button touch-target text-base-ko font-medium tracking-ko-normal focus-ring" 
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}