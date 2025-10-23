import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx'
import { Clock, Timer, Users, Upload, Palette, Menu, X } from 'lucide-react'
import './App.css'

function App() {
  // 選單狀態
  const [activeView, setActiveView] = useState('time')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
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
  const [volume, setVolume] = useState(0.3)
  const [customAlarmSound, setCustomAlarmSound] = useState(null)
  
  // 抽籤系統狀態
  const [totalPeople, setTotalPeople] = useState('')
  const [drawCount, setDrawCount] = useState('')
  const [drawnNumbers, setDrawnNumbers] = useState([])
  const [availableNumbers, setAvailableNumbers] = useState([])
  const [nameList, setNameList] = useState([])
  const [useNames, setUseNames] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [currentDrawResult, setCurrentDrawResult] = useState([])
  
  // 背景設定狀態
  const [backgroundColor, setBackgroundColor] = useState('#e8f4f8')
  const [backgroundImage, setBackgroundImage] = useState('')
  
  // 分組功能狀態
  const [groupParticipants, setGroupParticipants] = useState('')
  const [groupMethod, setGroupMethod] = useState('byCount') // 'byCount' 或 'byNumber'
  const [groupValue, setGroupValue] = useState('')
  const [groupResults, setGroupResults] = useState([])
  const [excludePairs, setExcludePairs] = useState([])
  const [groupNameList, setGroupNameList] = useState([])
  const [showGroupResultDialog, setShowGroupResultDialog] = useState(false)
  
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
  
  // 選單項目
  const menuItems = [
    { id: 'time', label: '當前時間', icon: Clock },
    { id: 'countdown', label: '倒數計時器', icon: Timer },
    { id: 'lottery', label: '抽籤系統', icon: Users },
    { id: 'grouping', label: '隨機分組', icon: Users },
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
      if (customAlarmSound) {
        // 使用自訂 MP3 音效
        const audio = new Audio(customAlarmSound)
        audio.volume = volume
        audio.play()
        playCountRef.current++
        
        audio.onended = () => {
          setTimeout(() => {
            playAlarmSound()
          }, 800)
        }
      } else {
        // 使用預設音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        
        playCountRef.current++
        
        setTimeout(() => {
          playAlarmSound()
        }, 800)
      }
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
    if (useNames && nameList.length > 0) {
      setAvailableNumbers([...nameList])
      setDrawnNumbers([])
    } else {
      const total = parseInt(totalPeople)
      if (total > 0) {
        const numbers = Array.from({ length: total }, (_, i) => i + 1)
        setAvailableNumbers(numbers)
        setDrawnNumbers([])
      }
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
      setCurrentDrawResult(newDrawn)
      setShowResultDialog(true)
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
  
  // 處理音效檔案上傳
  const handleAudioUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomAlarmSound(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // 處理名單匯入
  const handleNameListUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target.result
        const names = text.split(/[\n,]/).map(name => name.trim()).filter(name => name.length > 0)
        setNameList(names)
        setUseNames(true)
        setTotalPeople(names.length.toString())
      }
      reader.readAsText(file)
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
  
  // 渲染當前時間視圖
  const renderTimeView = () => (
    <div className="content-view time-view">
      <div className="view-header-with-selector">
        <div className="view-header">
          <Clock className="w-8 h-8" />
          <h1>當前時間</h1>
        </div>
        <div className="timezone-selector-inline">
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
      <div className="time-display-large">
        <div className="digital-time-large">{formatTime(currentTime)}</div>
        <div className="date-display-large">{formatDate(currentTime)}</div>
      </div>
    </div>
  )
  
  // 渲染倒數計時器視圖
  const renderCountdownView = () => (
    <div className="content-view countdown-view">
      <div className="view-header">
        <Timer className="w-8 h-8" />
        <h1>倒數計時器</h1>
      </div>
      
      {!isCountdownRunning && remainingTime === 0 ? (
        <div className="countdown-input-area-large">
          <div className="input-row">
            <div className="input-group-large">
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
            <div className="input-group-large">
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
          </div>
          <div className="audio-controls">
            <div className="volume-control">
              <Label htmlFor="volume">音量：{Math.round(volume * 100)}%</Label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>
            <div className="audio-upload">
              <Label htmlFor="audio-file">自訂音效</Label>
              <input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="file-input"
              />
              {customAlarmSound && (
                <Button 
                  onClick={() => setCustomAlarmSound(null)}
                  variant="outline"
                  size="sm"
                >
                  清除音效
                </Button>
              )}
            </div>
          </div>
          <Button onClick={startCountdown} className="start-btn-large">
            開始倒數
          </Button>
        </div>
      ) : (
        <div className="countdown-display-area-large">
          <div className="countdown-time-large">
            {formatCountdown(remainingTime)}
          </div>
          <div className="countdown-controls-large">
            {isCountdownRunning ? (
              <Button onClick={stopCountdown} variant="destructive" size="lg">
                停止
              </Button>
            ) : (
              <Button onClick={startCountdown} size="lg">
                繼續
              </Button>
            )}
            <Button onClick={resetCountdown} variant="outline" size="lg">
              重置
            </Button>
          </div>
        </div>
      )}
    </div>
  )
  
  // 渲染抽籤系統視圖
  const renderLotteryView = () => (
    <div className="content-view lottery-view">
      <div className="view-header">
        <Users className="w-8 h-8" />
        <h1>抽籤系統</h1>
      </div>
      
      <div className="name-list-upload">
        <Label htmlFor="name-list">匯入名單（文字檔，每行或逗號分隔）</Label>
        <input
          id="name-list"
          type="file"
          accept=".txt,.csv"
          onChange={handleNameListUpload}
          className="file-input"
        />
        {useNames && nameList.length > 0 && (
          <div className="name-list-info">
            <p>已載入 {nameList.length} 個名字</p>
            <Button 
              onClick={() => {
                setUseNames(false)
                setNameList([])
                setTotalPeople('')
              }}
              variant="outline"
              size="sm"
            >
              清除名單
            </Button>
          </div>
        )}
      </div>
      
      <div className="lottery-controls-large">
        <div className="input-group-large">
          <Label htmlFor="total-people">總人數</Label>
          <Input
            id="total-people"
            type="number"
            min="1"
            value={totalPeople}
            onChange={(e) => setTotalPeople(e.target.value)}
            placeholder="例如：50"
            disabled={useNames}
          />
        </div>
        <Button onClick={initializeLottery} variant="outline" size="lg">
          初始化
        </Button>
      </div>
      
      {availableNumbers.length > 0 && (
        <>
          <div className="lottery-controls-large">
            <div className="input-group-large">
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
            <Button onClick={performDraw} size="lg">
              抽籤
            </Button>
          </div>
          
          <div className="lottery-info-large">
            <p>剩餘人數：{availableNumbers.length}</p>
          </div>
        </>
      )}
      
      {drawnNumbers.length > 0 && (
        <div className="drawn-results-large">
          <h3>已抽中名單</h3>
          <div className="drawn-numbers-large">
            {drawnNumbers.map((num, index) => (
              <span key={index} className="drawn-number-large">
                {num}
              </span>
            ))}
          </div>
          <Button onClick={resetLottery} variant="outline" size="lg">
            重置抽籤
          </Button>
        </div>
      )}
    </div>
  )
  
  // 分組功能邏輯
  const performGrouping = () => {
    if (!groupParticipants.trim() || !groupValue) return
    
    // 解析參與者名單
    const participants = groupParticipants.split(/[\n,]/).map(p => p.trim()).filter(p => p.length > 0)
    if (participants.length === 0) return
    
    let groups = []
    const groupCount = groupMethod === 'byCount' ? parseInt(groupValue) : Math.ceil(participants.length / parseInt(groupValue))
    const peoplePerGroup = groupMethod === 'byNumber' ? parseInt(groupValue) : Math.ceil(participants.length / groupCount)
    
    // 隨機打亂參與者
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    
    // 分組
    for (let i = 0; i < shuffled.length; i += peoplePerGroup) {
      groups.push(shuffled.slice(i, i + peoplePerGroup))
    }
    
    setGroupResults(groups)
    setShowGroupResultDialog(true)
  }
  
  // 複製分組結果
  const copyGroupResults = () => {
    const text = groupResults.map((group, idx) => `第 ${idx + 1} 組：${group.join('、')}`).join('\n')
    navigator.clipboard.writeText(text)
    alert('已複製到剪貼簿')
  }
  
  // 處理分組名單匯入
  const handleGroupNameListUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target.result
        const names = text.split(/[\n,]/).map(name => name.trim()).filter(name => name.length > 0)
        setGroupParticipants(names.join('\n'))
      }
      reader.readAsText(file)
    }
  }
  
  // 渲染分組視圖
  const renderGroupingView = () => (
    <div className="content-view grouping-view">
      <div className="view-header">
        <Users className="w-8 h-8" />
        <h1>隨機分組</h1>
      </div>
      
      <div className="grouping-controls">
        <div className="input-group-large">
          <Label htmlFor="participants">參與者名單（每行或逗號分隔）</Label>
          <textarea
            id="participants"
            className="participants-textarea"
            value={groupParticipants}
            onChange={(e) => setGroupParticipants(e.target.value)}
            placeholder="輸入參與者名單，每行一個名字或用逗號分隔"
          />
        </div>
        
        <div className="file-upload-group">
          <Label htmlFor="group-name-list">或匯入名單檔案</Label>
          <input
            id="group-name-list"
            type="file"
            accept=".txt,.csv"
            onChange={handleGroupNameListUpload}
            className="file-input"
          />
        </div>
      </div>
      
      <div className="grouping-method">
        <div className="method-option">
          <input
            type="radio"
            id="byCount"
            name="groupMethod"
            value="byCount"
            checked={groupMethod === 'byCount'}
            onChange={(e) => setGroupMethod(e.target.value)}
          />
          <Label htmlFor="byCount">分成幾組</Label>
          {groupMethod === 'byCount' && (
            <Input
              type="number"
              min="1"
              value={groupValue}
              onChange={(e) => setGroupValue(e.target.value)}
              placeholder="輸入組數"
              className="method-input"
            />
          )}
        </div>
        
        <div className="method-option">
          <input
            type="radio"
            id="byNumber"
            name="groupMethod"
            value="byNumber"
            checked={groupMethod === 'byNumber'}
            onChange={(e) => setGroupMethod(e.target.value)}
          />
          <Label htmlFor="byNumber">每組幾人</Label>
          {groupMethod === 'byNumber' && (
            <Input
              type="number"
              min="1"
              value={groupValue}
              onChange={(e) => setGroupValue(e.target.value)}
              placeholder="輸入每組人數"
              className="method-input"
            />
          )}
        </div>
      </div>
      
      <Button onClick={performGrouping} size="lg" className="grouping-btn">
        開始分組
      </Button>
      
      {groupResults.length > 0 && (
        <div className="grouping-results">
          <h3>分組結果</h3>
          <div className="groups-display">
            {groupResults.map((group, idx) => (
              <div key={idx} className="group-card">
                <div className="group-title">第 {idx + 1} 組</div>
                <div className="group-members">
                  {group.map((member, memberIdx) => (
                    <span key={memberIdx} className="group-member">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={copyGroupResults} variant="outline" size="lg">
            複製結果
          </Button>
        </div>
      )}
    </div>
  )
  
  return (
    <div 
      className="app-container-sidebar"
      style={{
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >


      {/* 側邊選單 */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>功能選單</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="sidebar-bg-settings">
          <div className="bg-settings-title">
            <Palette className="w-5 h-5" />
            <span>背景設定</span>
          </div>
          
          <div className="bg-setting-item">
            <Label htmlFor="sidebar-bg-color">背景顏色</Label>
            <input
              id="sidebar-bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="sidebar-color-picker"
            />
          </div>
          
          <div className="bg-setting-item">
            <Label htmlFor="sidebar-bg-image">背景圖片</Label>
            <input
              id="sidebar-bg-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sidebar-file-input"
            />
          </div>
          
          {backgroundImage && (
            <Button 
              onClick={() => setBackgroundImage('')}
              variant="outline"
              size="sm"
              className="clear-bg-btn-sidebar"
            >
              清除背景圖
            </Button>
          )}
        </div>
      </div>

      {/* 主要內容區 */}
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {activeView === 'time' && renderTimeView()}
        {activeView === 'countdown' && renderCountdownView()}
        {activeView === 'lottery' && renderLotteryView()}
        {activeView === 'grouping' && renderGroupingView()}
      </div>

      {/* 行動版選單按鈕 */}
      {!isSidebarOpen && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu />
        </button>
      )}
      
      {/* 抽籤結果彈出視窗 */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="lottery-result-dialog">
          <DialogHeader>
            <DialogTitle>抽籤結果</DialogTitle>
            <DialogDescription>
              本次抽中 {currentDrawResult.length} 位
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-drawn-numbers">
            {currentDrawResult.map((item, index) => (
              <div key={index} className="dialog-drawn-item">
                {item}
              </div>
            ))}
          </div>
          <div className="dialog-actions">
            <Button onClick={() => setShowResultDialog(false)} size="lg">
              確定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App

