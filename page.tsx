'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, RefreshCw, Search, PlayCircle, MessageCircle, Repeat2, Heart, Send, Sparkles } from 'lucide-react'

type AnyGame = any
type Clip = any

function todayISO() { return new Date().toISOString().slice(0, 10) }
function team(game: AnyGame, side: 'away' | 'home') { return game?.teams?.[side]?.team?.abbreviation || game?.teams?.[side]?.team?.name || '' }
function score(game: AnyGame, side: 'away' | 'home') { return game?.teams?.[side]?.score ?? '-' }
function status(game: AnyGame) { return game?.status?.detailedState || game?.status?.abstractGameState || 'Unknown' }
function gameUrl(gamePk: string | number) { return `https://www.mlb.com/gameday/${gamePk}` }
function color(seed = '') {
  const colors = ['from-slate-950 to-slate-700', 'from-red-950 to-red-700', 'from-blue-950 to-blue-700', 'from-emerald-950 to-emerald-700', 'from-orange-950 to-orange-700']
  return colors[seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]
}
function inning(game: AnyGame) { const ls = game?.linescore; return ls?.currentInningOrdinal ? `${ls.inningHalf || ''} ${ls.currentInningOrdinal}`.trim() : '' }
function baseState(game: AnyGame) {
  const o = game?.linescore?.offense || {}; const bases = []
  if (o.first) bases.push('1B'); if (o.second) bases.push('2B'); if (o.third) bases.push('3B')
  return bases.length ? bases.join(' • ') : 'Bases empty'
}
function outs(game: AnyGame) { const n = game?.linescore?.outs; return typeof n === 'number' ? `${n} out${n === 1 ? '' : 's'}` : '' }
function fallbackClips(games: AnyGame[]) {
  return games.slice(0, 8).map((g, i) => ({ id: `fallback-${g.gamePk}-${i}`, title: `${team(g, 'away')} vs ${team(g, 'home')} highlights loading`, description: 'Direct MLB video has not published yet.', url: null, image: null, away: team(g, 'away'), home: team(g, 'home'), tag: 'LOADING', gamePk: g.gamePk }))
}
function quickHits(game: AnyGame) {
  const hits = []; const diff = Math.abs(Number(game?.teams?.away?.score || 0) - Number(game?.teams?.home?.score || 0)); const inn = game?.linescore?.currentInning || 0
  if (diff <= 1 && inn >= 7) hits.push('Late one-run game 👀')
  if ((Number(game?.teams?.away?.score || 0) + Number(game?.teams?.home?.score || 0)) >= 10) hits.push('Offense is exploding 💥')
  if (game?.linescore?.offense?.batter?.fullName) hits.push(`${game.linescore.offense.batter.fullName} batting`)
  if (game?.linescore?.defense?.pitcher?.fullName) hits.push(`${game.linescore.defense.pitcher.fullName} pitching`)
  return hits.length ? hits.slice(0, 3) : [`${team(game, 'away')} and ${team(game, 'home')} are underway.`]
}

function BoxScore({ game }: { game: AnyGame }) {
  const innings = game?.linescore?.innings || []
  return <div className="overflow-x-auto rounded-2xl bg-slate-50 p-2 text-xs"><table className="w-full"><thead><tr><th className="text-left">Team</th>{innings.map((x: any) => <th key={x.num}>{x.num}</th>)}<th>R</th><th>H</th><th>E</th></tr></thead><tbody>{['away','home'].map((side: any) => <tr key={side} className="font-bold"><td>{team(game, side)}</td>{innings.map((x: any) => <td key={`${side}-${x.num}`} className="text-center">{x[side]?.runs ?? '-'}</td>)}<td className="text-center">{game?.linescore?.teams?.[side]?.runs ?? 0}</td><td className="text-center">{game?.linescore?.teams?.[side]?.hits ?? 0}</td><td className="text-center">{game?.linescore?.teams?.[side]?.errors ?? 0}</td></tr>)}</tbody></table></div>
}

function GameCard({ game, notify }: { game: AnyGame, notify: (g: AnyGame) => void }) {
  const live = game?.status?.abstractGameState === 'Live'; const [open, setOpen] = useState(false)
  return <div className="overflow-hidden rounded-3xl bg-white shadow"><div className={`bg-gradient-to-br ${color(team(game, 'home'))} p-4 text-white`}><div className="flex justify-between gap-3"><span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">{status(game)}</span><button onClick={() => window.open(gameUrl(game.gamePk), '_blank')} className="rounded-xl bg-white px-3 py-1 text-sm font-bold text-black">Gamecast</button></div><div className="mt-5 grid grid-cols-[1fr_auto] gap-y-2 text-xl font-black"><div>{team(game, 'away')}</div><div className="text-4xl">{score(game, 'away')}</div><div>{team(game, 'home')}</div><div className="text-4xl">{score(game, 'home')}</div></div></div><div className="space-y-3 p-4">{live && <div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full border px-3 py-1">{inning(game)}</span><span className="rounded-full border px-3 py-1">{baseState(game)}</span><span className="rounded-full border px-3 py-1">{outs(game)}</span></div>}{live && <div className="space-y-2 rounded-2xl bg-slate-50 p-3"><div className="text-xs font-black uppercase text-slate-500">Quick Hits</div>{quickHits(game).map((h, i) => <div key={i} className="rounded-xl bg-white p-2 text-sm font-semibold">{h}</div>)}</div>}<div className="grid grid-cols-2 gap-2"><button onClick={() => setOpen(!open)} className="rounded-xl bg-black px-3 py-2 text-sm font-bold text-white">{open ? 'Hide Box' : 'Live Box'}</button><button onClick={() => notify(game)} className="rounded-xl border px-3 py-2 text-sm font-bold"><BellRing className="mr-1 inline h-4 w-4" /> Alert</button></div>{open && <BoxScore game={game} />}</div></div>
}

function ClipModal({ clip, close }: { clip: Clip | null, close: () => void }) {
  if (!clip) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"><div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-black text-white"><button onClick={close} className="m-3 rounded-full bg-white/20 px-3 py-1 font-bold">Close</button>{clip.url ? <video src={clip.url} controls autoPlay loop muted playsInline className="aspect-video w-full object-cover" /> : <div className="p-10 text-center">Clip still loading</div>}<div className="p-5"><div className="mb-2 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold">{clip.tag}</div><h2 className="text-2xl font-black">{clip.title}</h2><p className="text-white/70">{clip.description}</p></div></div></div>
}

function ClipCard({ clip, onWatch }: { clip: Clip, onWatch: (c: Clip) => void }) {
  return <button onClick={() => onWatch(clip)} className="relative min-h-[430px] w-full overflow-hidden rounded-[2rem] bg-black text-left text-white shadow-lg">{clip.url ? <video src={clip.url} autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-80" /> : clip.image ? <img src={clip.image} className="absolute inset-0 h-full w-full object-cover opacity-80" alt="" /> : <div className={`absolute inset-0 bg-gradient-to-br ${color(clip.home)}`} />}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" /><div className="absolute bottom-0 space-y-3 p-5"><span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">{clip.tag}</span><h3 className="text-2xl font-black">{clip.title}</h3><p className="text-sm text-white/75">{clip.away} @ {clip.home}</p><div className="rounded-2xl bg-white px-4 py-2 text-center font-bold text-black"><PlayCircle className="mr-2 inline h-4 w-4" />{clip.url ? 'Watch' : 'Waiting for clip'}</div></div></button>
}

function BaseballPost({ post, notify }: { post: any, notify: (p: any) => void }) {
  return <div className="rounded-3xl bg-white p-5 shadow"><div className="mb-3 flex items-center justify-between"><div><div className="font-black">Baseball Bot</div><div className="text-sm text-slate-500">@commandcenter • {post.time}</div></div><button onClick={() => notify(post)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">Follow</button></div><p className="mb-3 whitespace-pre-line text-lg font-semibold">{post.text}</p>{post.clip && <video src={post.clip} autoPlay loop muted playsInline className="mb-3 aspect-video w-full rounded-2xl object-cover" />}<div className="flex justify-between border-t pt-3 text-sm text-slate-500"><span><MessageCircle className="inline h-4 w-4" /> {post.comments}</span><span><Repeat2 className="inline h-4 w-4" /> {post.reposts}</span><span><Heart className="inline h-4 w-4" /> {post.likes}</span><span><Send className="inline h-4 w-4" /> Share</span></div></div>
}

function buildPosts(clips: Clip[]) {
  return clips.slice(0, 20).map((c, i) => {
    const title = (c.title || '').toLowerCase(); let text = `${c.away} vs ${c.home} is absolute cinema 🎥`; let priority = 1
    if (title.includes('walk-off') || title.includes('walk off')) { text = `🚨 WALK-OFF ALERT 🚨 ${c.title}`; priority = 10 }
    else if (title.includes('home run') || title.includes('homer') || title.includes('grand slam')) { text = `💣 NUKE ALERT 💣 ${c.title}\n🚀 ${c.exitVelo} MPH EV • ${c.distance} FT • ${c.stadiums}/30 parks`; priority = 9 }
    else if (title.includes('strikes out the side') || title.includes('fans all three') || title.includes('three strikeouts')) { text = `🥶 FILTHY INNING 🥶 ${c.title}`; priority = 8 }
    else if (title.includes('100 mph') || title.includes('101 mph') || title.includes('102 mph') || title.includes('103 mph')) { text = `🔥 GAS ALERT 🔥 ${c.title}\n⚡ ${c.pitchVelo} MPH`; priority = 9 }
    else if (title.includes('spin rate') || title.includes('rpm')) { text = `🌀 SPIN RATE DEMON 🌀 ${c.title}\n🌀 ${c.spinRate} RPM`; priority = 8 }
    else if (title.includes('diving catch') || title.includes('robs') || title.includes('web gem') || title.includes('great catch')) { text = `🧤 WEB GEM ALERT 🧤 ${c.title}\n🤯 This had no business being caught.`; priority = 8 }
    else if (title.includes('double') || title.includes('triple') || title.includes('rbi') || title.includes('bases-clearing')) { text = `🚨 OFFENSIVE EXPLOSION 🚨 ${c.title}`; priority = 7 }
    else if (title.includes('strikeout') || title.includes("k's") || title.includes('punches out')) { text = `😮‍💨 FILTH 😮‍💨 ${c.title}`; priority = 6 }
    return { id: `${c.id}-post`, text, clip: c.url, time: `${i + 1}m`, comments: 50 + priority * 15 + i * 4, reposts: 100 + priority * 30 + i * 7, likes: 500 + priority * 120 + i * 15, priority, category: c.tag }
  }).sort((a, b) => b.priority - a.priority)
}

function mergeFreshPosts(previousPosts: any[], newClips: Clip[]) {
  const newPosts = buildPosts(newClips).filter((post) => !post.id.includes('fallback'))
  const previousIds = new Set(previousPosts.map((post) => post.id))
  const freshPosts = newPosts.filter((post) => !previousIds.has(post.id)).map((post) => ({ ...post, isNew: true, time: 'now' }))
  const aged = previousPosts.map((post, index) => ({ ...post, isNew: false, time: post.time === 'now' ? '1m' : post.time || `${index + 2}m` }))
  return [...freshPosts, ...aged].sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 40)
}

const emptyLeaders = { battingAverage: [], obp: [], slugging: [], ops: [], homeRuns: [], steals: [], rbi: [], walks: [], wins: [], era: [], strikeouts: [], innings: [], saves: [] }

export default function BaseballCommandCenter() {
  const [date, setDate] = useState(todayISO())
  const [games, setGames] = useState<AnyGame[]>([])
  const [clips, setClips] = useState<Clip[]>([])
  const [activeClip, setActiveClip] = useState<Clip | null>(null)
  const [tab, setTab] = useState('feed')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const [socialPosts, setSocialPosts] = useState<any[]>([])
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [leagueLeaders, setLeagueLeaders] = useState<any>(emptyLeaders)

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch(`/api/schedule?date=${date}`)
      const data = await res.json()
      const nextGames = data?.dates?.flatMap((d: any) => d.games || []) || []
      setGames(nextGames)
      const clipsRes = await fetch('/api/clips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ games: nextGames }) })
      const clipsData = await clipsRes.json()
      const nextClips = clipsData?.clips || []
      const finalClips = nextClips.length ? nextClips : fallbackClips(nextGames)
      setClips(finalClips)
      setSocialPosts((prev) => mergeFreshPosts(prev, nextClips))
    } finally { setLoading(false) }
  }
  async function loadLeagueLeaders() {
    const res = await fetch(`/api/leaders?leagueFilter=${leagueFilter}`)
    const data = await res.json()
    setLeagueLeaders({ ...emptyLeaders, ...data })
  }
  async function enableAlerts() { if (typeof Notification === 'undefined') return; const p = await Notification.requestPermission(); setPermission(p); if (p === 'granted') new Notification('Baseball Command Center', { body: 'Alerts are on.' }) }
  function notifyGame(game: AnyGame) { if (permission !== 'granted') return enableAlerts(); new Notification(`${team(game, 'away')} @ ${team(game, 'home')}`, { body: `${status(game)} — ${score(game, 'away')}-${score(game, 'home')}` }) }
  function notifyPost(post: any) { if (permission !== 'granted') return enableAlerts(); new Notification('Baseball Bot posted', { body: post.text }) }

  useEffect(() => { refresh(); loadLeagueLeaders(); const id = setInterval(() => { refresh(); loadLeagueLeaders() }, 60000); return () => clearInterval(id) }, [date, leagueFilter])

  const filteredGames = useMemo(() => games.filter((g) => `${team(g, 'away')} ${team(g, 'home')}`.toLowerCase().includes(query.toLowerCase())), [games, query])
  const posts = socialPosts.length ? socialPosts : buildPosts(clips)
  const nav = [['feed', 'Feed'], ['games', 'Games'], ['leaders', 'Leaders'], ['studs', 'Studs'], ['social', 'Social'], ['news', 'News']]
  const leaderSections = [ ['Batting Average', 'AVG', leagueLeaders.battingAverage], ['On Base Percentage', 'OBP', leagueLeaders.obp], ['Slugging Percentage', 'SLG', leagueLeaders.slugging], ['OPS', 'OPS', leagueLeaders.ops], ['Home Runs', 'HR', leagueLeaders.homeRuns], ['Stolen Bases', 'SB', leagueLeaders.steals], ['Runs Batted In', 'RBI', leagueLeaders.rbi], ['Walks', 'BB', leagueLeaders.walks], ['Wins', 'W', leagueLeaders.wins], ['Earned Run Average', 'ERA', leagueLeaders.era], ['Strikeouts', 'K', leagueLeaders.strikeouts], ['Innings Pitched', 'IP', leagueLeaders.innings], ['Saves', 'SV', leagueLeaders.saves] ] as any[]

  return <div className="min-h-screen bg-slate-100 pb-24">{activeClip && <ClipModal clip={activeClip} close={() => setActiveClip(null)} />}<main className="mx-auto max-w-7xl space-y-5 p-4"><header className="rounded-[2rem] bg-black p-6 text-white shadow-xl"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-black uppercase text-red-400">Baseball TikTok x ESPN</div><h1 className="text-4xl font-black md:text-6xl">Command Center</h1><p className="mt-2 text-white/70">Embedded clips, live box scores, social posts, and alerts.</p></div><button onClick={enableAlerts} className="rounded-2xl bg-white px-4 py-2 font-bold text-black">{permission === 'granted' ? <BellRing className="inline h-4 w-4" /> : <Bell className="inline h-4 w-4" />} Alerts</button></div><div className="mt-5 flex gap-2"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl bg-white/10 p-2 text-white" /><button onClick={refresh} className="rounded-xl bg-white px-4 py-2 font-bold text-black"><RefreshCw className={`mr-2 inline h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div></header>
    <nav className="fixed bottom-3 left-1/2 z-40 grid w-[94vw] max-w-xl -translate-x-1/2 grid-cols-6 rounded-3xl bg-black p-1 text-white shadow-2xl md:static md:w-full md:translate-x-0">{nav.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-2xl px-2 py-3 text-xs font-bold ${tab === id ? 'bg-white text-black' : 'text-white'}`}>{label}</button>)}</nav>
    {tab === 'feed' && <section className="space-y-4"><div><h2 className="text-2xl font-black">Today's Feed</h2><p className="text-slate-500">Offensive, defensive, and pitching highlights from each game.</p></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{clips.map((c) => <ClipCard key={c.id} clip={c} onWatch={setActiveClip} />)}</div></section>}
    {tab === 'games' && <section className="space-y-4"><div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow"><Search className="h-4 w-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team..." className="w-full bg-transparent outline-none" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredGames.map((g) => <GameCard key={g.gamePk} game={g} notify={notifyGame} />)}</div></section>}
    {tab === 'leaders' && <section className="space-y-6"><div className="rounded-[2rem] bg-white p-6 shadow-xl"><div className="mb-6 flex items-center justify-between border-b pb-4"><div><div className="text-sm font-black uppercase tracking-wide text-slate-500">League Leaders</div><div className="mt-3 flex flex-wrap gap-2">{[['all','All MLB'],['AL','American League'],['NL','National League']].map(([id,label]) => <button key={id} onClick={() => setLeagueFilter(id)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${leagueFilter === id ? 'bg-black text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{label}</button>)}</div></div><div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Updated Live</div></div><div className="grid gap-8 lg:grid-cols-2">{leaderSections.map(([title, short, leaders]) => <div key={title}><div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2"><h3 className="text-xl font-black uppercase tracking-tight text-slate-800">{title}</h3><span className="text-sm font-black text-slate-500">{short}</span></div><div className="space-y-1">{(leaders || []).map((leader: any, i: number) => <div key={`${title}-${leader.player}`} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-100"><div className="text-sm font-bold text-slate-500">{i + 1}</div><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color(leader.team)}`}><span className="text-xs font-black text-white">{leader.team}</span></div><div><div className="cursor-pointer font-black text-blue-700 hover:underline">{leader.player}</div><div className="text-xs font-semibold text-slate-500">{leader.team}</div></div></div><div className="text-lg font-black text-slate-900">{leader.value}</div></div>)}</div><button className="mt-3 text-sm font-black text-blue-700 hover:underline">Complete Leaders</button></div>)}</div></div></section>}
    {tab === 'studs' && <section className="grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-emerald-700 p-5 text-white shadow"><div className="text-sm font-black">STUD</div><h3 className="text-3xl font-black">Shohei Ohtani</h3><p>3-4, 2 HR, 5 RBI</p><p className="mt-2 text-white/70">Moonshot merchant.</p></div><div className="rounded-3xl bg-red-800 p-5 text-white shadow"><div className="text-sm font-black">BUM</div><h3 className="text-3xl font-black">Random Closer</h3><p>0.2 IP, 4 ER, BS</p><p className="mt-2 text-white/70">Bullpen disasterclass.</p></div></section>}
    {tab === 'social' && <section className="space-y-4"><div className="rounded-3xl bg-black p-5 text-white"><Sparkles className="mb-2 h-5 w-5 text-red-400" /><h2 className="text-3xl font-black">Baseball Twitter Feed</h2><p className="text-white/70">Live auto-posts appear when new MLB highlights are detected. New posts get pushed to the top.</p></div>{posts.map((p) => <BaseballPost key={p.id} post={p} notify={notifyPost} />)}</section>}
    {tab === 'news' && <section className="grid gap-4 md:grid-cols-2"><button onClick={() => window.open('https://www.mlb.com/news', '_blank')} className="rounded-3xl bg-white p-5 text-left shadow"><h3 className="text-xl font-black">MLB News</h3><p className="text-slate-500">Official news and recaps.</p></button><button onClick={() => window.open('https://blogs.fangraphs.com/', '_blank')} className="rounded-3xl bg-white p-5 text-left shadow"><h3 className="text-xl font-black">FanGraphs</h3><p className="text-slate-500">Nerd baseball rabbit holes.</p></button></section>}
  </main></div>
}
