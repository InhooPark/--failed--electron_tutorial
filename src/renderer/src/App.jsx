// src/renderer/src/App.jsx
import React, { useState, useEffect } from 'react'

function App() {
  const [isMini, setIsMini] = useState(false)
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 앱 시작 시 데이터 로드

  useEffect(() => {
    const loadTodos = async () => {
      const savedTodos = await window.api.store.get('todos')
      if (savedTodos) setTodos(savedTodos)

      const savedLoginState = await window.api.store.get('isLoggedIn')
      console.log('app loaded. store isloggedin:', savedLoginState)
      if (savedLoginState === true) {
        setIsLoggedIn(true)
      }
    }
    loadTodos()
  }, [])

  // 투두 변경 시 저장
  useEffect(() => {
    if (todos) window.api.store.set('todos', todos)
  }, [todos])
  // is loggedin?
  // useEffect(() => {
  //   window.api.store.set('isLoggedIn', isLoggedIn)
  // }, [isLoggedIn])

  const toggleMiniMode = () => {
    if (isMini) {
      window.api.resizeWindow(400, 600)
    } else {
      window.api.resizeWindow(250, 150)
    }
    setIsMini(!isMini)
  }

  const addTodo = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    const newTodos = [...todos, { id: Date.now(), text: inputValue, done: false }]
    setTodos(newTodos)
    setInputValue('')
  }

  const toggleTodo = (id) => {
    const newTodos = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    setTodos(newTodos)
  }

  const deleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
  }
  const handleAuth = async () => {
    if (isLoggedIn) {
      await window.api.logout()
    } else {
      window.api.openSpotifyLogin()
    }
  }
  const handleDomReady = (e) => {
    const webview = e.target
    webview.insertCSS(`::-webkit-scrollbar{display:none;}`)
  }

  return (
    <div style={isMini ? styles.miniContainer : styles.container}>
      <div style={styles.dragBar}>
        {!isMini && <span>My Cozy Room 🏠</span>}
        <button onClick={toggleMiniMode} style={styles.button}>
          {isMini ? 'EXPAND' : 'MINI'}
        </button>
      </div>

      {!isMini && (
        <div style={styles.content}>
          {/* 👇 [핵심 변경] 유튜브 대신 Spotify 플레이어 배치 */}
          <div style={styles.spotifyFrame}>
            <webview
              style={{ width: '100%', height: '300px', borderRadius: '12px' }}
              // 여기에 원하는 스포티파이 플레이리스트 링크의 'embed' 주소를 넣으면 됩니다.
              // 예: Lofi Girl 플레이리스트
              src="https://open.spotify.com"
              partition="persist:spotify-session"
              allowpopups="true"
              plugins
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              onDomReady={handleDomReady}
            ></webview>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAuth}
              style={{
                ...styles.loginBtn,
                background: isLoggedIn ? '#555' : '#1db954'
              }}
            >
              {isLoggedIn ? 'Logout' : 'Spotify Login'}
            </button>
          </div>

          <div style={styles.todoSection}>
            <form onSubmit={addTodo} style={styles.inputForm}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={styles.input}
                placeholder="오늘 할 일은?"
              />
              <button type="submit" style={styles.addBtn}>
                +
              </button>
            </form>
            <ul style={styles.list}>
              {todos.map((todo) => (
                <li key={todo.id} style={styles.listItem}>
                  <span
                    onClick={() => toggleTodo(todo.id)}
                    style={{
                      ...styles.todoText,
                      textDecoration: todo.done ? 'line-through' : 'none',
                      color: todo.done ? '#aaa' : '#fff'
                    }}
                  >
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} style={styles.delBtn}>
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isMini && <div style={styles.miniContent}>🎵 Music On</div>}
    </div>
  )
}

const styles = {
  // ... (container, miniContainer, dragBar 등은 이전과 동일)
  container: {
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.75)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  miniContainer: {
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '15px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  dragBar: {
    height: '35px',
    background: '#333',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 15px',
    WebkitAppRegion: 'drag',
    cursor: 'move',
    borderBottom: '1px solid #444'
  },
  button: {
    WebkitAppRegion: 'no-drag',
    cursor: 'pointer',
    background: '#ff6b6b',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 'bold'
  },

  // 👇 content에 no-drag 속성 필수 유지!
  content: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    overflow: 'hidden',
    WebkitAppRegion: 'no-drag' // 클릭을 위해 필수
  },

  // 👇 [새 스타일] 스포티파이용 프레임 (높이 조절)
  spotifyFrame: {
    width: '100%',
    // 스포티파이 기본 높이에 맞춤
    height: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    // boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
    background: '#000'
  },
  loginBtn: {
    background: '#1db954',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px'
  },

  // 투두 스타일 (이전과 동일)
  todoSection: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  inputForm: { display: 'flex', gap: '8px', marginBottom: '15px' },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '14px'
  },
  addBtn: {
    padding: '0 15px',
    borderRadius: '5px',
    border: 'none',
    background: '#51cf66',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  list: { listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 5px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  todoText: { cursor: 'pointer', flex: 1, fontSize: '14px' },
  delBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff8787',
    cursor: 'pointer',
    marginLeft: '10px',
    padding: '5px'
  },
  miniContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold'
  }
}

export default App
