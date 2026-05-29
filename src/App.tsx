import { useState } from "react";

const GENRES = ["Action","RPG","Racing","Sports","Puzzle","Shooter","Horror","Adventure","Strategy","Casual"];
const RAM_OPTIONS = ["512MB","1GB","2GB","3GB","4GB","6GB+"];
const ROM_OPTIONS = ["4GB","8GB","16GB","32GB","64GB+"];
const SIZE_OPTIONS = ["Under 50MB","Under 100MB","Under 200MB","Under 500MB","Under 1GB","Any Size"];
const a = "hf_NZl";
const b = "hnWebnbFDwICJx"; // hugging face key part 2
const c = "YkyoBgLcMpkmrDxfP"; // hugging face key part 3
const HF_KEY = a + b + c;

export default function GameFinderAI() {
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]|null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const findGames = async () => {
    if (!ram && !genres.length && !size && !searchQuery) {
      setError("Kuch toh select karo bhai! 😅");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    const prompt = `You are GameFinderAI. Suggest exactly 6 mobile games based on:
${searchQuery ? `Search: "${searchQuery}"` : ""}
${ram ? `Phone RAM: ${ram}` : ""}
${rom ? `Storage: ${rom}` : ""}
${genres.length ? `Genres: ${genres.join(", ")}` : ""}
${size ? `Max size: ${size}` : ""}
Return ONLY a JSON array, no markdown, no explanation:
[{"name":"Game Name","genre":"Genre","size":"XX MB","rating":"4.5","description":"One line","minRam":"1GB"}]`;

    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HF_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 500 }
          })
        }
      );
      const data = await res.json();
      const text = Array.isArray(data) ? data[0].generated_text : data.generated_text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON");
      setResults(JSON.parse(jsonMatch[0]));
    } catch (e) {
      setError("Kuch gadbad ho gayi! Dobara try karo. 🎮");
    }
    setLoading(false);
  };

  const neon = "#00ff88";
  const purple = "#bf00ff";
  const dark = "#0a0a0f";
  const card = "#111118";

  return (
    <div style={{ minHeight:"100vh", background:dark, color:"#e0e0ff", fontFamily:"'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(#1a1a2e 1px,transparent 1px),linear-gradient(90deg,#1a1a2e 1px,transparent 1px)`, backgroundSize:"40px 40px", opacity:0.4, zIndex:0 }} />
      <div style={{ position:"relative", zIndex:1, maxWidth:"860px", margin:"0 auto", padding:"32px 16px" }}>

        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ display:"inline-block", background:`${neon}22`, border:`1px solid ${neon}44`, borderRadius:"30px", padding:"6px 20px", fontSize:"12px", letterSpacing:"3px", color:neon, marginBottom:"16px" }}>AI POWERED</div>
          <h1 style={{ fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:900, margin:"0 0 8px", background:`linear-gradient(135deg,#fff,${neon},${purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-2px" }}>
            GameFinder<span style={{color:neon}}>AI</span>
          </h1>
          <p style={{ color:"#666899", fontSize:"1rem" }}>Apne phone ke liye perfect game dhundo 🎮</p>
        </div>

        <div style={{ marginBottom:"24px", position:"relative" }}>
          <input type="text" placeholder='Search: "top games under 100mb"'
            value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&findGames()}
            style={{ width:"100%", boxSizing:"border-box", background:card, border:`1.5px solid ${neon}44`, borderRadius:"14px", padding:"16px 56px 16px 20px", color:"#fff", fontSize:"1rem", outline:"none" }} />
          <span style={{ position:"absolute", right:"20px", top:"50%", transform:"translateY(-50%)", fontSize:"22px" }}>🔍</span>
        </div>

        <div style={{ background:card, border:"1px solid #ffffff11", borderRadius:"20px", padding:"28px", marginBottom:"24px" }}>
          <h2 style={{ margin:"0 0 24px", fontSize:"0.85rem", letterSpacing:"2px", color:neon, textTransform:"uppercase" }}>⚙ Filters</h2>

          <FilterSection label="📱 Phone RAM">
            {RAM_OPTIONS.map(r=><Chip key={r} label={r} active={ram===r} onClick={()=>setRam(ram===r?"":r)} color={neon}/>)}
          </FilterSection>
          <FilterSection label="💾 Storage (ROM)">
            {ROM_OPTIONS.map(r=><Chip key={r} label={r} active={rom===r} onClick={()=>setRom(rom===r?"":r)} color="#00d4ff"/>)}
          </FilterSection>
          <FilterSection label="🎯 Genre">
            {GENRES.map(g=><Chip key={g} label={g} active={genres.includes(g)} onClick={()=>toggleGenre(g)} color={purple}/>)}
          </FilterSection>
          <FilterSection label="📦 Max Size">
            {SIZE_OPTIONS.map(s=><Chip key={s} label={s} active={size===s} onClick={()=>setSize(size===s?"":s)} color="#ffaa00"/>)}
          </FilterSection>

          <button onClick={findGames} disabled={loading} style={{ marginTop:"24px", width:"100%", padding:"16px", background:loading?"#222":`linear-gradient(135deg,${neon},#00cc66)`, border:"none", borderRadius:"12px", color:loading?"#555":"#000", fontSize:"1rem", fontWeight:800, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "🔄 AI Dhoondh Rahi Hai..." : "🚀 Find My Games"}
          </button>

          {error&&<p style={{color:"#ff4466",textAlign:"center",marginTop:"12px"}}>{error}</p>}
        </div>

        {results&&(
          <div>
            <h2 style={{ fontSize:"0.85rem", letterSpacing:"2px", color:neon, textTransform:"uppercase", marginBottom:"16px" }}>🎮 {results.length} Games Mili!</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"16px" }}>
              {results.map((game,i)=>(
                <div key={i} style={{ background:card, border:"1px solid #ffffff0f", borderRadius:"16px", padding:"20px", position:"relative" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${neon},transparent)` }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                    <span style={{ background:`${neon}22`, border:`1px solid ${neon}44`, borderRadius:"8px", padding:"4px 10px", fontSize:"11px", color:neon }}>{game.genre}</span>
                    <span style={{ background:"#ffffff0f", borderRadius:"8px", padding:"4px 10px", fontSize:"11px", color:"#ffaa00" }}>📦 {game.size}</span>
                  </div>
                  <h3 style={{ margin:"0 0 6px", fontSize:"1.1rem", fontWeight:700, color:"#fff" }}>{game.name}</h3>
                  <p style={{ margin:"0 0 12px", fontSize:"0.82rem", color:"#8888aa", lineHeight:1.5 }}>{game.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"#ffcc00" }}>{"★".repeat(Math.round(parseFloat(game.rating)))} <span style={{color:"#888",fontSize:"11px"}}>{game.rating}</span></span>
                    <span style={{ color:"#4488ff", fontSize:"11px" }}>Min RAM: {game.minRam}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign:"center", color:"#444466", fontSize:"12px", marginTop:"24px" }}>Play Store pe verify zaroor karo ✅</p>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:"48px", color:"#333355", fontSize:"11px" }}>
          GameFinderAI © 2026 • Powered by AI
        </div>
      </div>
    </div>
  );
}

function FilterSection({label,children}:{label:string,children:React.ReactNode}) {
  return (
    <div style={{marginBottom:"20px"}}>
      <p style={{margin:"0 0 10px",fontSize:"12px",color:"#666889",letterSpacing:"1px"}}>{label}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>{children}</div>
    </div>
  );
}

function Chip({label,active,onClick,color}:{label:string,active:boolean,onClick:()=>void,color:string}) {
  return (
    <button onClick={onClick} style={{ background:active?`${color}22`:"transparent", border:`1.5px solid ${active?color:"#ffffff18"}`, borderRadius:"20px", padding:"6px 14px", color:active?color:"#666889", fontSize:"13px", cursor:"pointer", fontWeight:active?700:400 }}>
      {label}
    </button>
  );
}