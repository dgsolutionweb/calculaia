import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FiSettings, FiShare2 } from 'react-icons/fi';
import styled from '@emotion/styled';
import Logo from '../Logo/Logo';
import InstallPWA from '../InstallPWA/InstallPWA';
import './CalculadoraIA.css';

// Inicializa a API do Google Generative AI
const genAI = new GoogleGenerativeAI('AIzaSyDhiEj8gry5uyjL3jyctG3Vn7un5hckYM4');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const MENSAGEM_INICIAL = 'Digite um valor e pressione = para começar';

// Temas disponíveis
const temas = {
    claro: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        background: '#ffffff',
        text: '#2c3e50',
    },
    escuro: {
        primary: '#0056b3',
        secondary: '#495057',
        success: '#1e7e34',
        danger: '#bd2130',
        background: '#343a40',
        text: '#f8f9fa',
    },
    moderno: {
        primary: '#6200ea',
        secondary: '#424242',
        success: '#00c853',
        danger: '#d50000',
        background: '#fafafa',
        text: '#212121',
    }
};

const CalculadoraIA = () => {
    const [display, setDisplay] = useState('0');
    const [expressao, setExpressao] = useState('');
    const [resultadoIA, setResultadoIA] = useState(MENSAGEM_INICIAL);
    const [isLoading, setIsLoading] = useState(false);
    const [historico, setHistorico] = useState([]);
    const [modoAvancado, setModoAvancado] = useState(false);
    const [sugestoes, setSugestoes] = useState(null);
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [tema, setTema] = useState('claro');
    const [configuracoesAbertas, setConfiguracoesAbertas] = useState(false);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [modoExibicao, setModoExibicao] = useState('padrao'); // padrao, grafico, analise

    // Botões extras para análise financeira
    const botoesFinanceiros = [
        { texto: 'ROI', tipo: 'financeiro' },
        { texto: 'Fluxo', tipo: 'financeiro' },
        { texto: 'Break-even', tipo: 'financeiro' },
        { texto: 'Projeção', tipo: 'financeiro' },
    ];

    useEffect(() => {
        // Carregar histórico do localStorage
        const historicoSalvo = localStorage.getItem('calculadoraHistorico');
        if (historicoSalvo) {
            setHistorico(JSON.parse(historicoSalvo));
        }

        // Carregar tema do localStorage
        const temaSalvo = localStorage.getItem('calculadoraTema');
        if (temaSalvo) {
            setTema(temaSalvo);
        }
    }, []);

    useEffect(() => {
        // Salvar histórico no localStorage
        localStorage.setItem('calculadoraHistorico', JSON.stringify(historico));
    }, [historico]);

    useEffect(() => {
        // Salvar tema no localStorage
        localStorage.setItem('calculadoraTema', tema);
        // Aplicar tema
        document.documentElement.style.setProperty('--primary-color', temas[tema].primary);
        document.documentElement.style.setProperty('--secondary-color', temas[tema].secondary);
        document.documentElement.style.setProperty('--success-color', temas[tema].success);
        document.documentElement.style.setProperty('--danger-color', temas[tema].danger);
        document.documentElement.style.setProperty('--background-color', temas[tema].background);
        document.documentElement.style.setProperty('--text-color', temas[tema].text);
    }, [tema]);

    const exportarDados = () => {
        const dados = {
            historico,
            configuracoes: {
                tema,
                modoAvancado
            }
        };
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'calculadora-dados.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const compartilharResultado = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'DGSolutionWEB CalculaIA - Resultado',
                    text: `Resultado calculado com DGSolutionWEB CalculaIA:\n\nCálculo: ${display}\n\nAnálise: ${resultadoIA}\n\nCalculado com inteligência artificial.`,
                    url: window.location.href
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        } else {
            // Fallback para navegadores que não suportam a Web Share API
            try {
                await navigator.clipboard.writeText(
                    `DGSolutionWEB CalculaIA - Resultado\n\nCálculo: ${display}\n\nAnálise: ${resultadoIA}\n\nCalculado com inteligência artificial.`
                );
                alert('Resultado copiado para a área de transferência!');
            } catch (error) {
                console.error('Erro ao copiar:', error);
                alert('Não foi possível compartilhar o resultado. Por favor, tente novamente.');
            }
        }
    };

    const analisarTendencias = async () => {
        if (historico.length < 2) return;

        const dados = historico.map((item, index) => ({
            id: index,
            valor: parseFloat(item.resultado),
            data: new Date(item.timestamp || Date.now()).toLocaleDateString()
        }));

        setDadosGrafico(dados);

        const prompt = `Analise as seguintes transações:
            ${dados.map(d => `${d.data}: R$ ${d.valor}`).join('\n')}
            
            Por favor, forneça:
            1. Análise de tendência dos valores
            2. Identificação de padrões
            3. Recomendações baseadas nos dados
            4. Projeção para próximas operações`;

        setIsLoading(true);
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setSugestoes(response.text());
        } catch (error) {
            console.error('Erro ao analisar tendências:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calcularIndicadoresFinanceiros = async (tipo) => {
        if (!ultimoResultado) return;

        const valor = parseFloat(ultimoResultado.toString().replace(/[^\d.-]/g, ''));
        let prompt = '';

        switch (tipo) {
            case 'ROI':
                prompt = `Calcule e analise o ROI para um investimento de R$ ${valor}:
                         1. ROI em diferentes cenários (otimista, realista, pessimista)
                         2. Tempo estimado de retorno
                         3. Comparação com investimentos similares
                         4. Recomendações para maximizar o retorno`;
                break;
            case 'Fluxo':
                prompt = `Analise o fluxo de caixa considerando uma receita de R$ ${valor}:
                         1. Projeção de fluxo de caixa para 6 meses
                         2. Sugestões para gestão de caixa
                         3. Identificação de possíveis gargalos
                         4. Estratégias de otimização`;
                break;
            case 'Break-even':
                prompt = `Calcule o ponto de equilíbrio considerando uma receita mensal de R$ ${valor}:
                         1. Estimativa de custos fixos e variáveis
                         2. Quantidade de vendas necessárias
                         3. Tempo estimado para atingir o break-even
                         4. Sugestões para reduzir o tempo de break-even`;
                break;
            case 'Projeção':
                prompt = `Faça uma projeção financeira baseada no valor R$ ${valor}:
                         1. Projeção de crescimento para 12 meses
                         2. Cenários de mercado
                         3. Fatores de risco e oportunidades
                         4. Estratégias de crescimento recomendadas`;
                break;
            default:
                return;
        }

        setIsLoading(true);
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setResultadoIA(response.text());
            
            // Gerar dados para o gráfico
            const dadosProjecao = gerarDadosProjecao(valor, tipo);
            setDadosGrafico(dadosProjecao);
            setModoExibicao('grafico');
        } catch (error) {
            console.error('Erro ao calcular indicadores:', error);
            setResultadoIA('Ocorreu um erro ao calcular os indicadores. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const gerarDadosProjecao = (valor, tipo) => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = [];
        
        switch (tipo) {
            case 'ROI':
                for (let i = 0; i < 12; i++) {
                    dados.push({
                        nome: meses[i],
                        investimento: valor,
                        retorno: valor * (1 + (0.1 * (i + 1))),
                    });
                }
                break;
            case 'Fluxo':
                for (let i = 0; i < 6; i++) {
                    dados.push({
                        nome: meses[i],
                        entrada: valor * (1 + (0.05 * i)),
                        saida: valor * 0.7,
                    });
                }
                break;
            case 'Break-even':
                const custoFixo = valor * 0.4;
                const custoVariavel = valor * 0.3;
                for (let i = 0; i < 12; i++) {
                    dados.push({
                        nome: meses[i],
                        receita: valor * (1 + (0.1 * i)),
                        custoTotal: custoFixo + (custoVariavel * (1 + (0.05 * i))),
                    });
                }
                break;
            case 'Projeção':
                for (let i = 0; i < 12; i++) {
                    dados.push({
                        nome: meses[i],
                        otimista: valor * (1 + (0.15 * i)),
                        realista: valor * (1 + (0.1 * i)),
                        pessimista: valor * (1 + (0.05 * i)),
                    });
                }
                break;
        }
        
        return dados;
    };

    const botoes = [
        { texto: 'C', tipo: 'funcao', acao: limpar },
        { texto: '⌫', tipo: 'funcao', acao: apagarUltimo },
        { texto: '%', tipo: 'operador' },
        { texto: '÷', tipo: 'operador' },
        { texto: '7', tipo: 'numero' },
        { texto: '8', tipo: 'numero' },
        { texto: '9', tipo: 'numero' },
        { texto: '×', tipo: 'operador' },
        { texto: '4', tipo: 'numero' },
        { texto: '5', tipo: 'numero' },
        { texto: '6', tipo: 'numero' },
        { texto: '-', tipo: 'operador' },
        { texto: '1', tipo: 'numero' },
        { texto: '2', tipo: 'numero' },
        { texto: '3', tipo: 'numero' },
        { texto: '+', tipo: 'operador' },
        { texto: 'R$', tipo: 'funcao', acao: formatarMoeda },
        { texto: '0', tipo: 'numero' },
        { texto: '.', tipo: 'numero' },
        { texto: '=', tipo: 'igual' },
    ];

    const botoesComerciais = [
        { texto: 'Desc %', tipo: 'comercial' },
        { texto: 'Markup', tipo: 'comercial' },
        { texto: 'Parcelas', tipo: 'comercial' },
        { texto: 'Lucro', tipo: 'comercial' },
        { texto: 'À Vista', tipo: 'comercial' },
        { texto: 'Pix (-5%)', tipo: 'comercial' },
        { texto: 'Cartão', tipo: 'comercial' },
        { texto: 'Custo', tipo: 'comercial' },
    ];

    function limpar() {
        setDisplay('0');
        setExpressao('');
        setResultadoIA(MENSAGEM_INICIAL);
        setSugestoes(null);
        setUltimoResultado(null);
    }

    function apagarUltimo() {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
            setExpressao(expressao.slice(0, -1));
        } else {
            setDisplay('0');
            setExpressao('');
        }
    }

    function formatarMoeda() {
        const numero = parseFloat(display.replace(/[^\d.-]/g, ''));
        if (!isNaN(numero)) {
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(numero);
            setDisplay(valorFormatado);
            setExpressao(valorFormatado);
        }
    }

    const handleBotao = async (botao) => {
        if (botao.tipo === 'funcao') {
            botao.acao();
            return;
        }

        if (botao.tipo === 'igual') {
            await calcular();
            return;
        }

        if (botao.tipo === 'comercial') {
            await calcularOperacaoComercial(botao.texto);
            return;
        }

        if (display === '0' && botao.tipo === 'numero') {
            setDisplay(botao.texto);
        } else {
            setDisplay(display + botao.texto);
        }

        setExpressao(expressao + botao.texto);
    };

    const calcularOperacaoComercial = async (operacao) => {
        if (!ultimoResultado) return;

        const valor = parseFloat(ultimoResultado.toString().replace(/[^\d.-]/g, ''));
        let prompt = '';

        switch (operacao) {
            case 'Desc %':
                prompt = `Calcule diferentes opções de desconto (5%, 10%, 15%, 20%) para o valor de R$ ${valor}. 
                         Mostre o valor final após cada desconto e quanto o cliente economiza.`;
                break;
            case 'Markup':
                prompt = `Calcule o markup e preço de venda sugerido para um produto com custo de R$ ${valor}, 
                         considerando diferentes margens de lucro (30%, 40%, 50%, 60%). 
                         Explique o cálculo e mostre o lucro esperado em cada cenário.`;
                break;
            case 'Parcelas':
                prompt = `Calcule as opções de parcelamento para o valor de R$ ${valor} em:
                         - 3x sem juros
                         - 6x com 1.99% a.m.
                         - 10x com 2.99% a.m.
                         - 12x com 3.99% a.m.
                         Mostre o valor de cada parcela e o total a prazo.`;
                break;
            case 'Lucro':
                prompt = `Para um produto vendido por R$ ${valor}, calcule:
                         1. Margem de lucro sugerida (%)
                         2. Valor do lucro em diferentes cenários
                         3. Sugestões para aumentar a margem
                         4. Comparação com média do mercado`;
                break;
            case 'À Vista':
                prompt = `Para o valor de R$ ${valor}, calcule:
                         1. Desconto sugerido para pagamento à vista (5-15%)
                         2. Valor final com cada desconto
                         3. Impacto na margem de lucro
                         4. Comparação com outras formas de pagamento`;
                break;
            case 'Pix (-5%)':
                const descontoPix = valor * 0.95;
                prompt = `Para o pagamento via Pix de R$ ${valor}:
                         1. Valor com 5% de desconto: R$ ${descontoPix.toFixed(2)}
                         2. Economia para o cliente: R$ ${(valor - descontoPix).toFixed(2)}
                         3. Vantagens do recebimento via Pix
                         4. Sugestões de comunicação para o cliente`;
                break;
            case 'Cartão':
                prompt = `Para o valor de R$ ${valor}, analise:
                         1. Taxas médias de cartão (Débito, Crédito)
                         2. Custo das taxas para cada modalidade
                         3. Preço sugerido para compensar as taxas
                         4. Comparativo entre as bandeiras`;
                break;
            case 'Custo':
                prompt = `Para um produto com preço de venda de R$ ${valor}, analise:
                         1. Estrutura de custos sugerida
                         2. Margem de lucro recomendada
                         3. Pontos de equilíbrio
                         4. Sugestões para redução de custos`;
                break;
            default:
                return;
        }

        setIsLoading(true);
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setResultadoIA(response.text());
            
            // Gerar sugestões baseadas no contexto
            const sugestoesPrompt = `Com base no cálculo anterior de ${operacao} para R$ ${valor}, 
                                   sugira 3 ações práticas que o lojista pode tomar para otimizar seus resultados. 
                                   Seja específico e considere o contexto do varejo.`;
            const sugestoesResult = await model.generateContent(sugestoesPrompt);
            const sugestoesResponse = await sugestoesResult.response;
            setSugestoes(sugestoesResponse.text());
        } catch (error) {
            console.error('Erro ao calcular operação comercial:', error);
            setResultadoIA('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const calcular = async () => {
        setIsLoading(true);
        try {
            // Primeiro, calcula o resultado básico
            const expressaoNumerica = display
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/R\$/g, '')
                .replace(/\./g, '')
                .replace(/,/g, '.');
            
            const resultado = eval(expressaoNumerica);
            setUltimoResultado(resultado);

            // Gera análise e sugestões
            const prompt = `Para o resultado de R$ ${resultado.toFixed(2)}, analise:
                          1. Sugestões de preço (à vista, parcelado, com desconto)
                          2. Margem de lucro recomendada
                          3. Opções de parcelamento sugeridas
                          4. Estratégias de precificação
                          
                          Formate a resposta usando Markdown para melhor visualização.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setResultadoIA(response.text());
            
            // Adicionar ao histórico
            setHistorico([...historico, {
                expressao: display,
                resultado: resultado.toFixed(2),
                analise: response.text()
            }]);

            // Atualiza o display com o resultado formatado
            setDisplay(new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(resultado));

        } catch (error) {
            console.error('Erro ao calcular:', error);
            setResultadoIA('Ocorreu um erro ao calcular. Por favor, verifique a expressão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="calculadora-container" data-tema={tema}>
            <InstallPWA />
            <div className="cabecalho">
                <Logo width={180} height={50} />
                <div className="acoes">
                    <button className="acao-btn" onClick={() => setConfiguracoesAbertas(true)}>
                        <FiSettings />
                    </button>
                    <button 
                        className="acao-btn compartilhar" 
                        onClick={compartilharResultado}
                        title="Compartilhar resultado"
                    >
                        <FiShare2 />
                    </button>
                </div>
            </div>

            {configuracoesAbertas && (
                <div className="configuracoes-modal">
                    <div className="configuracoes-conteudo">
                        <h3>Configurações</h3>
                        <div className="configuracao-item">
                            <label>Tema:</label>
                            <select value={tema} onChange={(e) => setTema(e.target.value)}>
                                <option value="claro">Claro</option>
                                <option value="escuro">Escuro</option>
                                <option value="moderno">Moderno</option>
                            </select>
                        </div>
                        <button onClick={() => setConfiguracoesAbertas(false)}>Fechar</button>
                    </div>
                </div>
            )}

            <div className="calculadora-wrapper">
                <div className="display-container">
                    <div className="display">{display}</div>
                </div>
                
                <div className="botoes-modo">
                    <button 
                        className={`modo-btn ${!modoAvancado ? 'ativo' : ''}`}
                        onClick={() => setModoAvancado(false)}
                    >
                        Básico
                    </button>
                    <button 
                        className={`modo-btn ${modoAvancado ? 'ativo' : ''}`}
                        onClick={() => setModoAvancado(true)}
                    >
                        Comercial
                    </button>
                </div>

                <div className="teclado-container">
                    {modoAvancado && (
                        <>
                            <div className="teclado-comercial">
                                {botoesComerciais.map((botao, index) => (
                                    <button
                                        key={index}
                                        className={`botao ${botao.tipo}`}
                                        onClick={() => handleBotao(botao)}
                                        disabled={isLoading || !ultimoResultado}
                                    >
                                        {botao.texto}
                                    </button>
                                ))}
                            </div>
                            <div className="teclado-financeiro">
                                {botoesFinanceiros.map((botao, index) => (
                                    <button
                                        key={index}
                                        className={`botao ${botao.tipo}`}
                                        onClick={() => calcularIndicadoresFinanceiros(botao.texto)}
                                        disabled={isLoading || !ultimoResultado}
                                    >
                                        {botao.texto}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="teclado-principal">
                        {botoes.map((botao, index) => (
                            <button
                                key={index}
                                className={`botao ${botao.tipo}`}
                                onClick={() => handleBotao(botao)}
                                disabled={isLoading}
                            >
                                {botao.texto}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="resultado-container">
                <div className="modo-exibicao-botoes">
                    <button 
                        className={`modo-btn ${modoExibicao === 'padrao' ? 'ativo' : ''}`}
                        onClick={() => setModoExibicao('padrao')}
                    >
                        Análise
                    </button>
                    <button 
                        className={`modo-btn ${modoExibicao === 'grafico' ? 'ativo' : ''}`}
                        onClick={() => setModoExibicao('grafico')}
                    >
                        Gráfico
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Calculando...</div>
                ) : (
                    <>
                        {modoExibicao === 'padrao' ? (
                            <>
                                <div className="markdown-resultado">
                                    <ReactMarkdown>{resultadoIA || MENSAGEM_INICIAL}</ReactMarkdown>
                                </div>
                                {sugestoes && (
                                    <div className="sugestoes-container">
                                        <h4>Sugestões para Otimização:</h4>
                                        <ReactMarkdown>{sugestoes || ''}</ReactMarkdown>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grafico-container">
                                {dadosGrafico.length > 0 ? (
                                    <LineChart width={600} height={300} data={dadosGrafico}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="nome" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {Object.keys(dadosGrafico[0])
                                            .filter(key => key !== 'nome')
                                            .map((key, index) => (
                                                <Line
                                                    key={key}
                                                    type="monotone"
                                                    dataKey={key}
                                                    stroke={temas[tema][Object.keys(temas[tema])[index % 4]]}
                                                    activeDot={{ r: 8 }}
                                                />
                                            ))}
                                    </LineChart>
                                ) : (
                                    <div className="sem-dados">
                                        Nenhum dado disponível para exibição em gráfico
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {historico.length > 0 && (
                <div className="historico-container">
                    <div className="historico-header">
                        <h3>Histórico de Operações</h3>
                        <button className="analise-btn" onClick={analisarTendencias}>
                            Analisar Tendências
                        </button>
                    </div>
                    <div className="historico-lista">
                        {historico.map((item, index) => (
                            <div key={index} className="historico-item">
                                <div className="historico-expressao">
                                    {item.expressao} = R$ {item.resultado}
                                </div>
                                <div className="historico-analise">
                                    <ReactMarkdown>{item.analise || 'Sem análise disponível'}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalculadoraIA;
