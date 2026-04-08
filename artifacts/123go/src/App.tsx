import { Switch, Route, Router as WouterRouter } from "wouter";
import { EntryScreen }       from "./pages/EntryScreen";
import { StudentCatalog }    from "./pages/StudentCatalog";
import { TeacherPinScreen }  from "./pages/TeacherPinScreen";
import { Catalog }           from "./pages/Catalog";

import { FestaDaLagarta }       from "./games/FestaDaLagarta";
import { ParOuImpar }           from "./games/ParOuImpar";
import { CacaEstrelas }         from "./games/CacaEstrelas";
import { LojaDeBala }           from "./games/LojaDeBala";
import { RaPuladora }           from "./games/RaPuladora";
import { BaloesdaFesta }        from "./games/BaloesdaFesta";
import { TremDosNumeros }       from "./games/TremDosNumeros";
import { PizzariaMagica }       from "./games/PizzariaMagica";
import { BatalhaConstelacoes }  from "./games/BatalhaConstelacoes";
import { AtelieOrdem }          from "./games/AtelieOrdem";
import { JardimPadroes }        from "./games/JardimPadroes";
import { NaveOrganizadora }     from "./games/NaveOrganizadora";
import { RoboPerdido }          from "./games/RoboPerdido";
import { EscondeEscondeAnimal } from "./games/EscondeEscondeAnimal";
import { CasteloPosicoes }      from "./games/CasteloPosicoes";
import { SolLuaEstrelas }       from "./games/SolLuaEstrelas";
import { CalendarioVivo }       from "./games/CalendarioVivo";
import { SorveteriaDados }      from "./games/SorveteriaDados";
import { ZooTabelas }           from "./games/ZooTabelas";
import { PesquisaTurma }        from "./games/PesquisaTurma";

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg)' }}>
      <div style={{ fontSize: 64 }}>🎮</div>
      <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, color: 'var(--text)' }}>Página não encontrada</h1>
      <a href="/student" style={{ background: 'var(--c3)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 15 }}>
        Voltar ao catálogo
      </a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/"            component={StudentCatalog} />
      <Route path="/student"     component={StudentCatalog} />
      <Route path="/teacher-pin" component={TeacherPinScreen} />
      <Route path="/catalog"     component={Catalog} />
      <Route path="/games/g01-festa-lagarta"       component={FestaDaLagarta} />
      <Route path="/games/g02-par-impar"           component={ParOuImpar} />
      <Route path="/games/g03-caca-estrelas"       component={CacaEstrelas} />
      <Route path="/games/g04-loja-balas"          component={LojaDeBala} />
      <Route path="/games/g05-ra-puladora"         component={RaPuladora} />
      <Route path="/games/g06-baloes-festa"        component={BaloesdaFesta} />
      <Route path="/games/g07-trem-numeros"        component={TremDosNumeros} />
      <Route path="/games/g08-pizzaria-magica"     component={PizzariaMagica} />
      <Route path="/games/g09-batalha-constelacoes" component={BatalhaConstelacoes} />
      <Route path="/games/g10-atelie-ordem"        component={AtelieOrdem} />
      <Route path="/games/g11-jardim-padroes"      component={JardimPadroes} />
      <Route path="/games/g12-nave-organizadora"   component={NaveOrganizadora} />
      <Route path="/games/g13-robo-perdido"        component={RoboPerdido} />
      <Route path="/games/g14-esconde-esconde"     component={EscondeEscondeAnimal} />
      <Route path="/games/g15-castelo-posicoes"    component={CasteloPosicoes} />
      <Route path="/games/g16-sol-lua-estrelas"    component={SolLuaEstrelas} />
      <Route path="/games/g17-calendario-vivo"     component={CalendarioVivo} />
      <Route path="/games/g19-sorveteria-dados"    component={SorveteriaDados} />
      <Route path="/games/g20-zoo-tabelas"         component={ZooTabelas} />
      <Route path="/games/g21-pesquisa-turma"      component={PesquisaTurma} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
