import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Section = 'journal' | 'todos'

type JournalEntry = {
  id: string
  title: string
  body: string
  date: string
  mood: string
}

type Todo = {
  id: string
  text: string
  completed: boolean
}

const today = new Date()
const todayLabel = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(today)

const starterEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'A little more present',
    body: 'Took the long way home this afternoon. The air felt like a reset, and I remembered that not every good thing needs to be planned.',
    date: 'Today · 9:42 AM',
    mood: 'Grateful',
  },
  {
    id: 'entry-2',
    title: 'Making room to think',
    body: 'A slow morning, a warm cup of tea, and a short list for the week. Starting small feels like the right kind of progress.',
    date: 'Yesterday · 8:16 AM',
    mood: 'Calm',
  },
]

const starterTodos: Todo[] = [
  { id: 'todo-1', text: 'Take a proper lunch break', completed: false },
  { id: 'todo-2', text: 'Pick up a few things for dinner', completed: false },
  { id: 'todo-3', text: 'Read a chapter before bed', completed: true },
]

function readSaved<T,>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [section, setSection] = useState<Section>('journal')
  const [entries, setEntries] = useState<JournalEntry[]>(() => readSaved('daybook-entries', starterEntries))
  const [todos, setTodos] = useState<Todo[]>(() => readSaved('daybook-todos', starterTodos))
  const [showEditor, setShowEditor] = useState(false)
  const [entryTitle, setEntryTitle] = useState('')
  const [entryBody, setEntryBody] = useState('')
  const [todoText, setTodoText] = useState('')

  useEffect(() => {
    localStorage.setItem('daybook-entries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem('daybook-todos', JSON.stringify(todos))
  }, [todos])

  const remainingTodos = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos])

  function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!entryTitle.trim() || !entryBody.trim()) return

    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        title: entryTitle.trim(),
        body: entryBody.trim(),
        date: `Today · ${new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date())}`,
        mood: 'Just checking in',
      },
      ...current,
    ])
    setEntryTitle('')
    setEntryBody('')
    setShowEditor(false)
  }

  function addTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!todoText.trim()) return
    setTodos((current) => [...current, { id: crypto.randomUUID(), text: todoText.trim(), completed: false }])
    setTodoText('')
  }

  function toggleTodo(id: string) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">d</span><span>daybook</span></div>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          <button className={`nav-item ${section === 'journal' ? 'active' : ''}`} onClick={() => setSection('journal')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.75A1.75 1.75 0 0 1 6.75 3H20v15H6.75A1.75 1.75 0 0 0 5 19.75v-15Z" /><path d="M5 19.75A1.75 1.75 0 0 1 6.75 18H20M9 7h7M9 10h7" /></svg>
            <span>Journal</span><span className="nav-count">{entries.length}</span>
          </button>
          <button className={`nav-item ${section === 'todos' ? 'active' : ''}`} onClick={() => setSection('todos')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /><path d="M20 12v7H4V5h10" /></svg>
            <span>To-do list</span><span className="nav-count">{remainingTodos}</span>
          </button>
        </nav>
        <div className="sidebar-note"><span className="note-sparkle">✳</span><p>A little space to slow down, sort things out, and make room for what matters.</p></div>
        <div className="profile"><div className="avatar">A</div><div><strong>Alex Morgan</strong><span>Your personal space</span></div><button className="more-button" aria-label="More profile options">···</button></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">My space <span>/</span> <strong>{section === 'journal' ? 'Journal' : 'To-do list'}</strong></div><div className="today-chip"><span className="sun-icon">☼</span>{todayLabel}</div></header>

        {section === 'journal' ? (
          <section className="page-section" aria-labelledby="journal-title">
            <div className="page-heading"><div><div className="eyebrow">A MOMENT FOR YOU</div><h1 id="journal-title">Your journal<span className="heading-period">.</span></h1><p className="page-description">A place to gather your thoughts, one day at a time.</p></div><button className="primary-button" onClick={() => setShowEditor((shown) => !shown)}><span className="plus-sign">+</span> New entry</button></div>
            <div className="journal-toolbar"><div className="section-title"><span className="tiny-sun">✳</span><h2>Recent reflections</h2><span className="entry-total">{entries.length}</span></div><button className="sort-button">Newest first <span>⌄</span></button></div>
            {showEditor && <form className="entry-editor" onSubmit={saveEntry}><div className="editor-topline"><div className="editor-icon">✎</div><div><strong>Start with what’s on your mind</strong><span>{todayLabel}</span></div><button type="button" className="close-editor" onClick={() => setShowEditor(false)} aria-label="Close editor">×</button></div><input aria-label="Entry title" placeholder="Give this entry a title..." value={entryTitle} onChange={(event) => setEntryTitle(event.target.value)} required /><textarea aria-label="Journal entry" placeholder="Write freely. This space is just for you..." value={entryBody} onChange={(event) => setEntryBody(event.target.value)} required rows={4} /><div className="editor-actions"><span>✦ &nbsp;Take a breath. There’s no wrong way to write.</span><button className="primary-button" type="submit">Save entry <span>↗</span></button></div></form>}
            <div className="entry-list">{entries.map((entry, index) => <article className={`entry-card ${index === 0 ? 'featured-entry' : ''}`} key={entry.id}><div className="entry-date"><span className="date-dot" />{entry.date}</div><h3>{entry.title}</h3><p>{entry.body}</p><div className="entry-footer"><span className="mood-tag"><span>✳</span>{entry.mood}</span><button className="entry-menu" aria-label={`Options for ${entry.title}`}>···</button></div></article>)}</div>
            <div className="gentle-reminder"><span>✳</span><p>Some days, showing up is the whole story.</p><span className="reminder-line" /></div>
          </section>
        ) : (
          <section className="page-section todo-page" aria-labelledby="todo-title">
            <div className="page-heading"><div><div className="eyebrow">ONE THING AT A TIME</div><h1 id="todo-title">A lighter list<span className="heading-period">.</span></h1><p className="page-description">Make a little room in your head by putting it all here.</p></div><div className="task-summary"><strong>{remainingTodos}</strong><span>left for today</span></div></div>
            <div className="todo-panel"><div className="section-title"><span className="todo-heading-icon">✓</span><h2>Today’s to-dos</h2><span className="entry-total">{todos.length}</span></div><form className="todo-form" onSubmit={addTodo}><span className="todo-add-icon">+</span><input aria-label="Add a to-do" placeholder="Add something to your list..." value={todoText} onChange={(event) => setTodoText(event.target.value)} /><button type="submit">Add to list</button></form><div className="todo-list">{todos.map((todo) => <div className={`todo-row ${todo.completed ? 'completed' : ''}`} key={todo.id}><button className="check-button" onClick={() => toggleTodo(todo.id)} aria-label={todo.completed ? `Mark ${todo.text} incomplete` : `Complete ${todo.text}`}>{todo.completed && <span>✓</span>}</button><span className="todo-text">{todo.text}</span><button className="delete-todo" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.text}`}>×</button></div>)}{todos.length === 0 && <div className="empty-todos"><span>✳</span><strong>All clear for now.</strong><p>Add a small next step whenever it comes to you.</p></div>}</div><div className="todo-footer"><span>{todos.length - remainingTodos} completed</span><button onClick={() => setTodos((current) => current.filter((todo) => !todo.completed))}>Clear completed</button></div></div>
            <div className="todo-quote"><span className="quote-mark">“</span><div><p>You don’t have to do it all today.</p><span>Give yourself permission to take it one step at a time.</span></div><span className="quote-flower">✳</span></div>
          </section>
        )}
        <footer className="app-footer"><span>Made for your everyday, by you.</span><span>Take it at your own pace <span className="footer-heart">♡</span></span></footer>
      </main>
    </div>
  )
}

export default App
