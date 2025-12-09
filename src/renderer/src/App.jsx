// src/renderer/src/App.jsx
import React, { useState } from 'react' // useState 추가
import ReactPlayer from 'react-player'

function App() {
  // 미니 모드인지 아닌지 기억하는 상태 변수
  const [isMini, setIsMini] = useState(false)

  // 버튼 클릭 시 실행될 함수
  const toggleMiniMode = () => {
    if (isMini) {
      // 원래대로 커지기 (너비 400, 높이 500)
      window.api.resizeWindow(400, 500)
    } else {
      // 작아지기 (너비 200, 높이 150)
      window.api.resizeWindow(200, 150)
    }
    // 상태 반전 (true <-> false)
    setIsMini(!isMini)
  }

  return (
    <div style={isMini ? styles.miniContainer : styles.container}>
      <div style={styles.dragBar}>
        {/* 미니 모드일 때는 제목을 숨겨서 깔끔하게 */}
        {!isMini && <span>My Cozy Room 🏠</span>}

        {/* 우측 상단에 미니 모드 버튼 추가 */}
        <button onClick={toggleMiniMode} style={styles.button}>
          {isMini ? 'EXPAND' : 'MINI'}
        </button>
      </div>

      {/* 미니 모드가 아닐 때만 TV 보이기 (또는 미니모드용 UI로 교체 가능) */}
      {!isMini && (
        <div style={styles.content}>
          <div style={styles.tvFrame}>
            <ReactPlayer
              url="https://www.youtube.com/watch?v=5qap5aO4i9A"
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              volume={0.5}
            />
          </div>
        </div>
      )}

      {/* 미니 모드일 때 보여줄 간단한 UI */}
      {isMini && (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '10px' }}>🎵 Music On</div>
      )}
    </div>
  )
}

// 스타일 업데이트
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  miniContainer: {
    // 미니 모드용 스타일
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.8)', // 좀 더 진하게
    borderRadius: '15px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  dragBar: {
    height: '30px',
    background: '#333',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // 버튼을 끝으로 보내기 위해
    padding: '0 10px',
    WebkitAppRegion: 'drag',
    cursor: 'move'
  },
  button: {
    WebkitAppRegion: 'no-drag', // 중요: 버튼은 드래그 되면 안 됨! 클릭되어야 함
    cursor: 'pointer',
    background: '#ff6b6b',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    padding: '2px 8px',
    fontSize: '10px'
  },
  content: {
    flex: 1,
    padding: '20px'
  },
  tvFrame: {
    width: '100%',
    aspectRatio: '16/9',
    background: '#000',
    borderRadius: '10px',
    overflow: 'hidden'
  }
}

export default App
