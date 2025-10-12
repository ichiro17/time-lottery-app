import { useState, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Clock, Timer, Users, Upload, Palette } from 'lucide-react'
import './App.css'

function App() {
  // 時間與時區狀態
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timezone, setTimezone] = useState('Asia/Taipei')
  
  // 倒數計時器狀態
  const [countdownMinutes, setCountdownMinutes] = useState('')
  const [countdownSeconds, setCountdownSeconds] = useState('')
  const [remainingTime, setRemainingTime] = useState(0)
  const [isCountdownRunning, setIsCountdownRunning] = useState(false)
  const audioRef = useRef(null)
  const playCountRef = useRef(0)
  
  // 抽籤系統狀態
  const [totalPeople, setTotalPeople] = useState('')
  const [drawCount, setDrawCount] = useState('')
  const [drawnNumbers, setDrawnNumbers] = useState([])
  const [availableNumbers, setAvailableNumbers] = useState([])
  
  // 背景設定狀態
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
  const [backgroundImage, setBackgroundImage] = useState('')
  
  // 時區列表
  const timezones = [
    { value: 'Asia/Taipei', label: '台北 (GMT+8)' },
    { value: 'Asia/Tokyo', label: '東京 (GMT+9)' },
    { value: 'Asia/Shanghai', label: '上海 (GMT+8)' },
    { value: 'Asia/Hong_Kong', label: '香港 (GMT+8)' },
    { value: 'Asia/Singapore', label: '新加坡 (GMT+8)' },
    { value: 'America/New_York', label: '紐約 (GMT-5)' },
    { value: 'America/Los_Angeles', label: '洛杉磯 (GMT-8)' },
    { value: 'Europe/London', label: '倫敦 (GMT+0)' },
    { value: 'Europe/Paris', label: '巴黎 (GMT+1)' },
    { value: 'Australia/Sydney', label: '雪梨 (GMT+11)' },
  ]
  
  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // 倒數計時器邏輯
  useEffect(() => {
    if (isCountdownRunning && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isCountdownRunning && remainingTime === 0) {
      setIsCountdownRunning(false)
      playAlarm()
    }
  }, [isCountdownRunning, remainingTime])
  
  // 播放提醒音樂
  const playAlarm = () => {
    playCountRef.current = 0
    playAlarmSound()
  }
  
  const playAlarmSound = () => {
    if (playCountRef.current < 3) {
      // 使用 Web Audio API 生成柔和的提示音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 440 // A4 音符
      oscillator.type = 'sine' // 柔和的正弦波
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
      
      playCountRef.current++
      
      setTimeout(() => {
        playAlarmSound()
      }, 800)
    }
  }
  
  // 開始倒數計時
  const startCountdown = () => {
    const minutes = parseInt(countdownMinutes) || 0
    const seconds = parseInt(countdownSeconds) || 0
    const totalSeconds = minutes * 60 + seconds
    
    if (totalSeconds > 0) {
      setRemainingTime(totalSeconds)
      setIsCountdownRunning(true)
    }
  }
  
  // 停止倒數計時
  const stopCountdown = () => {
    setIsCountdownRunning(false)
    setRemainingTime(0)
  }
  
  // 重置倒數計時
  const resetCountdown = () => {
    setIsCountdownRunning(false)
    setRemainingTime(0)
    setCountdownMinutes('')
    setCountdownSeconds('')
  }
  
  // 初始化抽籤人數
  const initializeLottery = () => {
    const total = parseInt(totalPeople)
    if (total > 0) {
      const numbers = Array.from({ length: total }, (_, i) => i + 1)
      setAvailableNumbers(numbers)
      setDrawnNumbers([])
    }
  }
  
  // 執行抽籤
  const performDraw = () => {
    const count = parseInt(drawCount)
    if (count > 0 && availableNumbers.length > 0) {
      const toDraw = Math.min(count, availableNumbers.length)
      const newDrawn = []
      const remaining = [...availableNumbers]
      
      for (let i = 0; i < toDraw; i++) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        newDrawn.push(remaining[randomIndex])
        remaining.splice(randomIndex, 1)
      }
      
      setDrawnNumbers([...drawnNumbers, ...newDrawn])
      setAvailableNumbers(remaining)
    }
  }
  
  // 重置抽籤
  const resetLottery = () => {
    setDrawnNumbers([])
    setAvailableNumbers([])
    setTotalPeople('')
    setDrawCount('')
  }
  
  // 處理背景圖片上傳
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBackgroundImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // 格式化時間顯示
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  }
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    }).format(date)
  }
  
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  return (
    <div 
      className="app-container"
      style={{
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景設定控制 */}
      <div className="bg-controls">
        <div className="bg-control-item">
          <Label htmlFor="bg-color" className="control-label">
            <Palette className="w-4 h-4" />
            背景顏色
          </Label>
          <input
            id="bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <div className="bg-control-item">
          <Label htmlFor="bg-image" className="control-label">
            <Upload className="w-4 h-4" />
            背景圖片
          </Label>
          <input
            id="bg-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
        </div>
        {backgroundImage && (
          <Button 
            onClick={() => setBackgroundImage('')}
            variant="outline"
            size="sm"
            className="clear-bg-btn"
          >
            清除背景圖
          </Button>
        )}
      </div>

      {/* 主要內容區域 */}
      <PanelGroup direction="vertical" className="main-panel-group">
        {/* 頂部時間區域 */}
        <Panel defaultSize={25} minSize={15} className="panel-wrapper">
          <div className="time-panel">
            <div className="panel-header">
              <Clock className="w-6 h-6" />
              <h2>當前時間</h2>
            </div>
            <div className="time-display">
              <div className="digital-time">{formatTime(currentTime)}</div>
              <div className="date-display">{formatDate(currentTime)}</div>
            </div>
            <div className="timezone-selector">
              <Label htmlFor="timezone">時區選擇</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Panel>
        
        <PanelResizeHandle className="resize-handle horizontal" />
        
        {/* 下方兩區域 */}
        <Panel defaultSize={75} minSize={30}>
          <PanelGroup direction="horizontal">
            {/* 倒數計時區 */}
            <Panel defaultSize={50} minSize={30} className="panel-wrapper">
              <div className="countdown-panel">
                <div className="panel-header">
                  <Timer className="w-6 h-6" />
                  <h2>倒數計時器</h2>
                </div>
                
                {!isCountdownRunning && remainingTime === 0 ? (
                  <div className="countdown-input-area">
                    <div className="input-group">
                      <Label htmlFor="minutes">分鐘</Label>
                      <Input
                        id="minutes"
                        type="number"
                        min="0"
                        value={countdownMinutes}
                        onChange={(e) => setCountdownMinutes(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="input-group">
                      <Label htmlFor="seconds">秒鐘</Label>
                      <Input
                        id="seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={countdownSeconds}
                        onChange={(e) => setCountdownSeconds(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <Button onClick={startCountdown} className="start-btn">
                      開始倒數
                    </Button>
                  </div>
                ) : (
                  <div className="countdown-display-area">
                    <div className="countdown-time">
                      {formatCountdown(remainingTime)}
                    </div>
                    <div className="countdown-controls">
                      {isCountdownRunning ? (
                        <Button onClick={stopCountdown} variant="destructive">
                          停止
                        </Button>
                      ) : (
                        <Button onClick={startCountdown}>
                          繼續
                        </Button>
                      )}
                      <Button onClick={resetCountdown} variant="outline">
                        重置
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Panel>
            
            <PanelResizeHandle className="resize-handle vertical" />
            
            {/* 抽籤區 */}
            <Panel defaultSize={50} minSize={30} className="panel-wrapper">
              <div className="lottery-panel">
                <div className="panel-header">
                  <Users className="w-6 h-6" />
                  <h2>抽籤系統</h2>
                </div>
                
                <div className="lottery-controls">
                  <div className="input-group">
                    <Label htmlFor="total-people">總人數</Label>
                    <Input
                      id="total-people"
                      type="number"
                      min="1"
                      value={totalPeople}
                      onChange={(e) => setTotalPeople(e.target.value)}
                      placeholder="例如：50"
                    />
                  </div>
                  <Button onClick={initializeLottery} variant="outline">
                    初始化
                  </Button>
                </div>
                
                {availableNumbers.length > 0 && (
                  <>
                    <div className="lottery-controls">
                      <div className="input-group">
                        <Label htmlFor="draw-count">抽取人數</Label>
                        <Input
                          id="draw-count"
                          type="number"
                          min="1"
                          max={availableNumbers.length}
                          value={drawCount}
                          onChange={(e) => setDrawCount(e.target.value)}
                          placeholder="一次抽幾位"
                        />
                      </div>
                      <Button onClick={performDraw}>
                        抽籤
                      </Button>
                    </div>
                    
                    <div className="lottery-info">
                      <p>剩餘人數：{availableNumbers.length}</p>
                    </div>
                  </>
                )}
                
                {drawnNumbers.length > 0 && (
                  <div className="drawn-results">
                    <h3>已抽中名單</h3>
                    <div className="drawn-numbers">
                      {drawnNumbers.map((num, index) => (
                        <span key={index} className="drawn-number">
                          {num}
                        </span>
                      ))}
                    </div>
                    <Button onClick={resetLottery} variant="outline" size="sm">
                      重置抽籤
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App

