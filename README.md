# Bibliterapia — nova landing page

Página estática em português, mobile primeiro, com layout próprio para desktop a partir de 900 px. Abertura com arte e faixa de compra, materiais em linhas alternadas, passos em painel roxo, oferta com preço em destaque, complementos e dúvidas. Paleta roxa, lilás, amarela e laranja.

## Publicar no GitHub e na Vercel
1. Descompacte o ZIP e envie os arquivos para a raiz do repositório no GitHub.
2. Na Vercel, importe o repositório e selecione Other. Não há dependências nem comando de build. Saída: `.`.
3. Publique. Use `index.html` com os arquivos modulares. `PREVIA_COMPLETA.html` serve para visualizar offline e contém imagens, fontes, estilos e scripts incorporados.

## Configuração
Edite `config.js`: checkoutUrl contém o checkout Hotmart; price é R$ 17,90; supportEmail deve receber seu contato real; metaPixelId está vazio. Preencha somente o ID numérico do pixel, nunca um token de API.

Todos os sete botões de compra têm o checkout real no HTML e funcionam sem JavaScript. Parâmetros de campanha são preservados no redirecionamento. Navegação interna e controles de privacidade têm funções próprias.

## Produtos
O pacote principal contém Manual Bíblico + Mapa Bíblico + Manual dos 4 Evangelhos.
Desenhos para colorir, marca-textos, artes para canecas, Tabela Periódica da Bíblia e 4 Evangelhos Ilustrados são opcionais cobrados à parte. Configure disponibilidade e cobrança na Hotmart. Não há cobrança nem seleção fictícia nesta página.
As imagens são representações ilustrativas dos arquivos digitais, não fotografias ou capturas dos PDFs. Não há envio de produtos físicos.

## Desempenho e acessibilidade
Uma única folha de estilo (`nova.css`), JavaScript sem bibliotecas, duas fontes WOFF2 locais e imagens WebP. O hero usa srcset e prioridade alta; as demais imagens grandes têm carregamento adiado. Dimensões explícitas reservam espaço para imagens. Sem vídeos automáticos, bibliotecas de animação, frameworks ou chamadas externas para fontes.
Movimentos usam transform e opacity, pausam fora da tela e respeitam movimento reduzido. Botão no rodapé pausa e retoma animações. Conteúdo permanece acessível sem JavaScript. Fontes Lilita One e Nunito com licenças OFL incluídas.

Verificação: HTML, IDs, arquivos, links de compra, sintaxe JavaScript, consentimento, preço e integridade do ZIP. Não foi possível testar visualmente em navegador ou medir Lighthouse/PageSpeed neste ambiente. Velocidade e notas reais precisam ser medidas após publicar; nenhuma nota ou taxa de conversão é garantida.

## Pixel e privacidade
Pixel inativo sem ID válido e autorização para publicidade. Eventos: PageView, ViewContent e CheckoutClick (personalizado). Purchase e InitiateCheckout devem vir do checkout Hotmart; cliques não disparam compra. Consentimento pode ser recusado ou revogado. Antes de anunciar, valide os eventos no Gerenciador de Eventos e preencha identificação, contato e informações reais na política de privacidade.

## Apresentação com foco em conversão
Oferta e preço na abertura, sete botões de compra, imagens ilustrativas 3D para cada um dos três materiais e CTA após a apresentação do kit. Mantém os complementos separados. Não utiliza depoimentos inventados, urgência fictícia nem preço anterior sem comprovação. A taxa de conversão real depende dos anúncios, público, oferta e checkout; deve ser medida após publicar.

## Últimos ajustes
Imagem da abertura sem círculo roxo e imagens dos materiais sobre fundo branco. Barra fixa de compra roxa com preço branco e botão amarelo, também visível como barra flutuante no desktop. Entradas dos blocos ao aparecerem na rolagem, sem temporizador que antecipe as animações fora da tela; movimento reduzido e controle de pausa preservados.

## Interações ampliadas
Mouse: cards sobem suavemente, ícones inclinam, imagens ampliam discretamente, preços e títulos reagem e botões recebem brilho e seta em movimento. Celular: blocos entram por baixo e materiais entram alternando os lados, com pequenos atrasos entre itens. O efeito de entrada ocorre uma vez por bloco durante a visita. Efeitos de hover limitados a mouse real para evitar estados presos ao toque. Pausa e preferência de movimento reduzido preservadas. Sem scripts de rolagem contínua ou dependências novas.
