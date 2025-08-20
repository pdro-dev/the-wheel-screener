import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X, ChevronRight } from 'lucide-react';
import WheelSimulator from './WheelSimulator';
import Quiz from './Quiz';
import FeedbackWidget from './FeedbackWidget';
import GlossaryTooltip from './GlossaryTooltip';

/**
 * Página principal do módulo tutorial
 */
export default function TutorialPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do tutorial
  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Em produção, isso seria uma chamada para API
        // Por enquanto, simulamos com dados estáticos
        const mockLessons = {
          nav: [
            { id: "intro", title: "Introdução ao The Wheel", anchor: "introducao-ao-the-wheel" },
            { id: "quant", title: "Fundamentos de Trading Quantitativo", anchor: "fundamentos-de-trading-quantitativo" },
            { id: "sentiment", title: "Indicadores de Sentimento e Opções", anchor: "indicadores-de-sentimento-e-opcoes" },
            { id: "macro", title: "Indicadores Macroeconômicos", anchor: "indicadores-macroeconomicos" },
            { id: "models", title: "Modelos Quantitativos de Apoio", anchor: "modelos-quantitativos-de-apoio" },
            { id: "data", title: "Dados Disponíveis na Aplicação", anchor: "dados-disponiveis-na-aplicacao" },
            { id: "interactivity", title: "Interatividade", anchor: "interatividade" },
            { id: "best-practices", title: "Boas Práticas", anchor: "boas-praticas" }
          ],
          quizzes: {
            "wheel-basics": {
              id: "wheel-basics",
              title: "Conceitos Básicos de The Wheel",
              questions: [
                {
                  id: "q1",
                  prompt: "Na venda de put cash-secured, qual é a fonte de retorno principal?",
                  choices: [
                    "Apreciação do ativo subjacente",
                    "Prêmio recebido na venda da put",
                    "Dividendos",
                    "Alavancagem com margem"
                  ],
                  answerIndex: 1,
                  explanation: "O retorno primário é o prêmio recebido ao vender a put; se exercido, o custo efetivo é strike - prêmio."
                },
                {
                  id: "q2",
                  prompt: "Após ser exercido na put, o próximo passo no The Wheel é:",
                  choices: [
                    "Vender outra put",
                    "Comprar calls a mercado",
                    "Vender covered call sobre as ações recebidas",
                    "Encerrar a estratégia"
                  ],
                  answerIndex: 2,
                  explanation: "Com as ações em carteira, vende-se covered call para continuar gerando renda."
                },
                {
                  id: "q3",
                  prompt: "IV Rank elevado tende a implicar:",
                  choices: [
                    "Prêmios de opções mais baixos",
                    "Prêmios de opções mais altos",
                    "Menor risco de exercício",
                    "Delta próximo de zero"
                  ],
                  answerIndex: 1,
                  explanation: "IV Rank alto indica IV alta vs. histórico, elevando prêmios; risco e variância também tendem a aumentar."
                }
              ]
            }
          }
        };
        
        setLessons(mockLessons);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar lições:', error);
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  const handleFeedback = (feedbackData) => {
    console.log('Feedback recebido:', feedbackData);
    // Em produção, enviar para API
  };

  const handleQuizComplete = (results) => {
    console.log('Quiz completado:', results);
    // Em produção, salvar progresso do usuário
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregando tutorial...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Tutorial / Educacional</h1>
            </div>
            <div className="text-sm text-gray-500">
              The Wheel Screener Academy
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Conteúdo</h2>
              <nav className="space-y-2">
                {lessons?.nav.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Content Area */}
              <div className="p-8">
                {activeSection === 'intro' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        🔹 Introdução ao The Wheel
                      </h2>
                      <div className="prose max-w-none">
                        <h3>Conceito Fundamental</h3>
                        <p>
                          A estratégia <strong>The Wheel</strong> é um ciclo contínuo de operações com opções 
                          que busca gerar renda recorrente através de prêmios. O ciclo funciona da seguinte forma:
                        </p>
                        <p className="text-lg font-medium text-blue-600">
                          <strong>Puts → Ações → Calls → Repeat</strong>
                        </p>

                        <h3>Como Funciona</h3>
                        <h4>1. Puts Cash-Secured</h4>
                        <ul>
                          <li>Vende-se uma opção de <strong>put</strong> com caixa reservado para eventual exercício</li>
                          <li>Recebe-se o <strong>prêmio</strong> pela venda da put</li>
                          <li>Se exercido, compra-se o ativo pelo <GlossaryTooltip term="Strike" /> da put</li>
                          <li>O custo efetivo é: <code>Strike - Prêmio recebido</code></li>
                        </ul>

                        <h4>2. Covered Calls</h4>
                        <ul>
                          <li>Com as ações em carteira, vende-se <strong>calls cobertas</strong></li>
                          <li>Gera-se renda adicional através dos prêmios das calls</li>
                          <li>Se exercido, entrega-se as ações pelo strike da call</li>
                          <li>Reinicia-se o ciclo vendendo puts novamente</li>
                        </ul>

                        <h3>Benefícios</h3>
                        <ul>
                          <li>✅ <strong>Geração de renda</strong> por prêmios de forma recorrente</li>
                          <li>✅ <strong>Disciplina operacional</strong> com regras claras de entrada/saída</li>
                          <li>✅ <strong>Abordagem sistemática</strong> e replicável</li>
                          <li>✅ <strong>Redução do custo médio</strong> através dos prêmios recebidos</li>
                        </ul>

                        <h3>Riscos</h3>
                        <ul>
                          <li>⚠️ <strong>Exercício em mercados em queda</strong> (drawdowns significativos)</li>
                          <li>⚠️ <strong>Concentração em poucos ativos/setores</strong></li>
                          <li>⚠️ <strong>Spreads largos</strong> em opções com baixa liquidez</li>
                          <li>⚠️ <strong>Gaps de mercado</strong> que podem impactar severamente a posição</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'interactivity' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        🔹 Interatividade
                      </h2>
                      <p className="text-gray-600 mb-8">
                        Use os simuladores abaixo para praticar os conceitos da estratégia The Wheel 
                        com diferentes parâmetros e visualizar os resultados.
                      </p>
                    </div>

                    {/* Simulador de Put Cash-Secured */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Simulador: Put Cash-Secured
                      </h3>
                      <WheelSimulator mode="put" />
                    </div>

                    {/* Simulador de Covered Call */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Simulador: Covered Call
                      </h3>
                      <WheelSimulator mode="coveredCall" />
                    </div>

                    {/* Quiz */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Quiz: Conceitos Básicos
                      </h3>
                      {lessons?.quizzes?.["wheel-basics"] && (
                        <Quiz
                          questions={lessons.quizzes["wheel-basics"].questions}
                          title={lessons.quizzes["wheel-basics"].title}
                          onComplete={handleQuizComplete}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Outras seções podem ser implementadas aqui */}
                {activeSection !== 'intro' && activeSection !== 'interactivity' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {lessons?.nav.find(item => item.id === activeSection)?.title}
                      </h2>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-blue-800">
                          Esta seção está em desenvolvimento. Em breve, você encontrará aqui 
                          conteúdo detalhado sobre {lessons?.nav.find(item => item.id === activeSection)?.title.toLowerCase()}.
                        </p>
                        <p className="text-blue-700 mt-2">
                          Por enquanto, explore os simuladores na seção "Interatividade" para 
                          praticar os conceitos da estratégia The Wheel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Widget */}
              <div className="border-t border-gray-200 p-6">
                <FeedbackWidget
                  onSubmit={handleFeedback}
                  sectionId={activeSection}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

