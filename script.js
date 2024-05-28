async function fontMenu(){
    const modal = document.querySelector('.modal')
    const button = document.querySelector('.open-font-config')
    const closeModal = document.querySelector('#closePopup')
    const fontSizeInput = document.getElementById("fontSize");
    const applyFontSize = document.getElementById("applyFontSize");
    const fontSizeValue = document.getElementById("fontSizeValue");
    const content = document.querySelector("body");
        
    button.onclick = function () {
        modal.showModal();
    }
    
    closeModal.onclick = function () {
        modal.close();
    }

    fontSizeInput.addEventListener("input", function() {
        fontSizeValue.textContent = fontSizeInput.value + "px";
    });

    applyFontSize.addEventListener("click", function() {
        const newSize = fontSizeInput.value + "px";
        content.style.fontSize = newSize;
    });
}

//variaveis do index

let alunosF = []; //lista dos alunos q levarão falta
let selectMat = [];//lista dos profs
var codigomateriaA = "";//codigo da materia selecionada
var codigoprofessorA = "";//codigo do professor selecionado
var nomeProfessorA = "";//nome do professor selecionado
var tSelect = ""; //turma selecionada 
var tDay = "";// variavel controle de dia 
var diaDaSemanaNome = "";
flagDiaria = false;

/*
//Get Geral
async function buscarTodosAlunos() {
    const response = await fetch('http://localhost:3000/api/alunos');
    const data = await response.json();
    return data;
}
*/

/*
async function dataTeste() {
    const dataAtual = document.getElementById("formData").value;  
    console.log(dataAtual);
}*/

async function logicaData(){

    let diasDaSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dataAtual = document.getElementById("formData").value;
    const dataAtualDate = new Date(dataAtual);

    let diaDaSemanaNumero = dataAtualDate.getDay();
    diaDaSemanaNome = diasDaSemana[diaDaSemanaNumero]
    
    console.log(diaDaSemanaNome);

    //console.log(dataAtual);
}


async function getDayData() {
    var selectElement = document.getElementById('formTurma');
    var selectedValueTurma = selectElement.value;
    flagDiaria = false;
    const response = await fetch(`http://localhost:3000/api/dayM/${codigomateriaA}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        var test1 = obj.turma;
        var test2 = obj.dia;
        if(test1  == selectedValueTurma  && test2  == diaDaSemanaNome){
            tSelect = obj.turma;
            tDay = obj.dia;
            flagDiaria = true; 
        }    
    });
} 


//Get turma 
async function buscarTurma() {
    var selectElement = document.getElementById('formTurma');
    var selectedValueTurma = selectElement.value;
    await getDayData();
    if(flagDiaria == true){
        const response = await fetch(`http://localhost:3000/api/alunosT/${selectedValueTurma}`);
        const data = await response.json();
        return data;
    }else{
        alert("Sem aula da materia selecionada esse dia" );
        const lista = document.getElementById('alunos-list');
        lista.innerHTML = '';
        selectElement.selectedIndex = 0;
    }
}

//botão do lado de cada nome
function criarBotao(aluno) {
    let clickB = 0;
    const botao = document.createElement('button');
    botao.classList.add('button-aluno')
    botao.textContent = 'Falta';
    botao.addEventListener('click', () => {
        if(clickB == 0){
            alunosF.push(aluno);
            botao.textContent = 'Remover Falta';
            clickB = 1; 
            botao.classList.toggle('button-aluno-active');
        }else{
            const indice = alunosF.indexOf(aluno); 
            if (indice !== -1) {
                alunosF.splice(indice, 1); // Remove o elemento encontrado
            }
            botao.textContent = 'Falta';
            clickB = 0;
            botao.classList.remove('button-aluno-active');
        }
        console.log(alunosF);
        console.log(alunosF.length);

    });
    return botao;
}



async function verifyExibirAlunos(){
    var selectElement = document.getElementById('formMat');
    var selectElement2 = document.getElementById('formTurma');
    var selectedValueMateriaV = selectElement.value;
    var dateV = document.getElementById("formData").value;
    if(selectedValueMateriaV == "oops" || dateV == ""){
        alert("Selecione a data e a materia para registrar faltas");
        selectElement2.selectedIndex = 0;
    }else{
        exibirAlunos()
    }

}
//Exibe os alunos do get

async function exibirAlunos() {
    const resposta = await buscarTurma();
    const alunos = resposta.result; 
    const lista = document.getElementById('alunos-list');
    lista.innerHTML = '';
    alunos.forEach(aluno => {
        const nameLi = document.createElement('div'); // elemento de lista
        nameLi.classList.add('form-check')
        const label_name = document.createElement('label')
        label_name.classList.add('form-check-label')
        label_name.textContent = aluno.nome;
        const botao = criarBotao(aluno);
        nameLi.appendChild(label_name); //botão colocado dentro dos paragrafos com o nome
        nameLi.appendChild(botao);
        lista.appendChild(nameLi); // paragrafos colocados dentro da ul
    });
}

//simula o envio do e-mail

function criarMensagemFaltas(nomeAluno) {

    const mensagem = `Caros pais,\n\nO aluno ${nomeAluno} apresenta uma alta quantidade de faltas e corre risco de reprovação por conta disso. Por favor, venham à escola para discutirmos o assunto o quanto antes possível.\n\nAtenciosamente,\n[Escola Octógono]`;


    const nomeArquivo = `mensagem_faltas_${nomeAluno.replace(' ', '_')}.txt`;

    const blob = new Blob([mensagem], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    console.log(`Arquivo '${nomeArquivo}' criado com sucesso.`);
}

//update 
async function atualizarFaltas() {
    for (const alunoA of alunosF) {

        if (alunoA.nmrfaltas >= 10){
            alert("Aluno: " + alunoA.nome + " com numero de faltas elevado, mandando e-mail");
            criarMensagemFaltas(alunoA.nome)

        }


        const dadosAtualizados = {
            nmrfaltas: (alunoA.nmrfaltas + 1)
        };

        try {
            console.log(JSON.stringify(dadosAtualizados));
            const resposta = await fetch(`http://localhost:3000/api/alunos/${alunoA.codigo}`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            });
    
            if (resposta.ok) {
                console.log(`Quantidade de faltas atualizada para o aluno com código ${alunoA.codigo}.`);
            } else {
                console.error('Erro ao atualizar quantidade de faltas do aluno:', resposta.statusText);
                throw new Error('Erro ao atualizar quantidade de faltas do aluno');
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade de faltas do aluno:', error);
            throw error;
        }
    }
}

 
//pega dados do professor da materia
async function mpData() {
    var selectElementM = document.getElementById('formMat');
    var selectedValueMat = selectElementM.value;
    if(selectedValueMat !== "oops"){
        const response = await fetch(`http://localhost:3000/api/professorMM/${selectedValueMat}`);
        const data = await response.json();
        DR = data.result;
        DR.forEach(prof => {
            codigomateriaA = prof.codigomateria;
            codigoprofessorA = prof.codigoprofessor;
            console.log(codigomateriaA);
            console.log(codigoprofessorA);
        });
        profName()
    }
}

//pega nome do professor
async function profName() {
    const response = await fetch(`http://localhost:3000/api/professor/${codigoprofessorA}`);
    const data = await response.json();
    DP = data.result;
    DP.forEach(prof => {
        nomeProfessorA = prof.nome;
    });
    var paragrafP = document.getElementById("PnameP");
    paragrafP.innerHTML = nomeProfessorA;
}  

//verifica se tudo foi selecionado corretamente 
async function verifyInserirF(){
    if(alunosF.length === 0){
        alert("Faltas não marcadas, seleciona as opções necessarias");
    } else{
        inserirF();
    }
}


//Post faltas
async function inserirF() {

    const dataAtual = document.getElementById("formData").value;

    console.log(dataAtual);

    atualizarFaltas();

    for (const aluno of alunosF) {

       
        const dadosFalta = {
            "data": dataAtual, 
            "codigoaluno": aluno.codigo, 
            "codigomateria": codigomateriaA, 
            "codigoprofessor": codigoprofessorA,
        };

        console.log('Dados da falta a serem enviados:', JSON.stringify(dadosFalta));
        try {
            const resposta = await fetch('http://localhost:3000/api/Ifalta', {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(dadosFalta),
                headers: {
                    'Content-Type': 'application/json'  
                }
                
            });

            if (resposta.ok) {
                console.log(`Falta marcada para o aluno ${aluno.nome}`);
                console.log(JSON.stringify(dadosFalta));

            } else {
                console.error('Erro ao marcar falta:', resposta.statusText);
            }
        } catch (erro) {
            console.error('Erro ao marcar falta:', erro);
        }
    }
    alert('faltas marcadas');
    location.reload();
}

//------------------------------------------------PAGINA DE REGISTRO------------------------------------------------------------------

//variaveis de registro
var RegName = "";
var RegTurma = "";
var RegNmrF = "";
var RegNameM = "";
var RegNameP = "";


var FiltroS;

//espera um tempo
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function regAname(codAluno) {
    var objResult = "";
    const response = await fetch(`http://localhost:3000/api/aluno/${codAluno}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        objResult = obj.nome;
    });
    RegName = objResult;
}


async function regTu(codAluno) {
    var objResult = "";
    const response = await fetch(`http://localhost:3000/api/aluno/${codAluno}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        objResult = obj.turma;
    });
    RegTurma = objResult;
    switch (RegTurma) {
        case "1 Fund":
          RegTurma = "1 Fundamental";
          break;
        case "2 Fund":
          RegTurma = "2 Fundamental";
          break;
        case "3 Fund":
          RegTurma = "3 Fundamental";
          break;
        case "4 Fund":
          RegTurma = "4 Fundamental";
          break;
        case "5 Fund":
          RegTurma = "5 Fundamental";
          break;
        default:
          break;
      }
       
}

async function regAf(codAluno) {
    var objResult = "";
    const response = await fetch(`http://localhost:3000/api/aluno/${codAluno}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        objResult = obj.nmrfaltas;
    });
    RegNmrF = objResult;
} 

async function regMat(codMat) {
    var objResult = "";
    const response = await fetch(`http://localhost:3000/api/materia/${codMat}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        objResult = obj.nome;
    });
    RegNameM = objResult;
}  

async function regProf(codprof) {
    var objResult = "";
    const response = await fetch(`http://localhost:3000/api/professor/${codprof}`);
    const data = await response.json();
    DR = data.result;
    DR.forEach(obj => {
        objResult = obj.nome;
    });
    RegNameP = objResult;
}  




//Get Geral
async function buscarTodosRegistros() {
    const response = await fetch('http://localhost:3000/api/faltas');
    const data = await response.json();
    return data;
}

async function exibirRegistros() {
    const resposta = await buscarTodosRegistros();
    const regs = resposta.result; 
    const lista = document.getElementById('tabela-faltas');
    lista.innerHTML = '';
    for (const aluno of regs) {
        
        regAname(aluno.codigoaluno);
        regAf(aluno.codigoaluno);
        regTu(aluno.codigoaluno);
        regMat(aluno.codigomateria);
        regProf(aluno.codigoprofessor);
        await esperar(120);

        const nameLi = document.createElement('div'); 
        nameLi.classList.add('faltas-linha-container')

        const label_data = document.createElement('p')
        label_data.classList.add('falta-info')
        label_data.textContent = aluno.data;

        const label_nomeA = document.createElement('p')
        label_nomeA.classList.add('falta-info')
        label_nomeA.textContent = RegName;

        const label_nomeT = document.createElement('p')
        label_nomeT.classList.add('falta-info')
        label_nomeT.textContent = RegTurma;
     
        const label_qtdnF = document.createElement('p')
        label_qtdnF.classList.add('falta-info')
        label_qtdnF.textContent = RegNmrF;

        const label_mat = document.createElement('p')
        label_mat.classList.add('falta-info')
        label_mat.textContent = RegNameM;

        const label_prof = document.createElement('p')
        label_prof.classList.add('falta-info')
        label_prof.textContent = RegNameP;


        nameLi.appendChild(label_data);
        nameLi.appendChild(label_nomeA);
        nameLi.appendChild(label_nomeT);
        nameLi.appendChild(label_qtdnF);
        nameLi.appendChild(label_mat);
        nameLi.appendChild(label_prof);
        

        lista.appendChild(nameLi); 
    }
}

//filtro

async function filtroNome() {

    var selectElement = document.getElementById('buscaNome');
    var selectedValue = selectElement.value;
    const response = await fetch(`http://localhost:3000/api/alunoN/${selectedValue}`);
    const data = await response.json();
    var Dr = data.result;
    Dr.forEach(obj => {
        objResult = obj.codigo;
        FiltroS = objResult
    });
    await esperar(80);
    const response2 = await fetch(`http://localhost:3000/api/faltaA/${FiltroS}`);
    const data2 = await response2.json();
    return data2;
}

async function filtroMat() {

    var selectElement = document.getElementById('buscaMateria');
    var selectedValue = selectElement.value;
    const response = await fetch(`http://localhost:3000/api/materiaN/${selectedValue}`);
    const data = await response.json();
    var Dr = data.result;
    Dr.forEach(obj => {
        objResult = obj.codigo;
        FiltroS = objResult
    });
    await esperar(80);
    const response2 = await fetch(`http://localhost:3000/api/faltaM/${FiltroS}`);
    const data2 = await response2.json();
    return data2;
}

async function filtroData() {

    var selectElement = document.getElementById('buscaData');
    var selectedValue = selectElement.value;
    const response2 = await fetch(`http://localhost:3000/api/faltaD/${selectedValue}`);
    const data2 = await response2.json();
    return data2;
    
}

async function exibirRegistrosF(numChoice) {
    //const resposta = await buscarTodosRegistros();
    var resposta;
    switch (numChoice) {
        case 1:
           resposta = await filtroNome();
           break;
        case 2:
           resposta = await filtroMat();
           break;
        case 3:
           resposta = await filtroData();
           break;
    }
    const regs = resposta.result; 
    const lista = document.getElementById('tabela-faltas');
    lista.innerHTML = '';
    for (const aluno of regs) {
        
        regAname(aluno.codigoaluno);
        regAf(aluno.codigoaluno);
        regTu(aluno.codigoaluno);
        regMat(aluno.codigomateria);
        regProf(aluno.codigoprofessor);
        await esperar(80);

        const nameLi = document.createElement('div'); 
        nameLi.classList.add('faltas-linha-container')

        const label_data = document.createElement('p')
        label_data.classList.add('falta-info')
        label_data.textContent = aluno.data;

        const label_nomeA = document.createElement('p')
        label_nomeA.classList.add('falta-info')
        label_nomeA.textContent = RegName;

        const label_nomeT = document.createElement('p')
        label_nomeT.classList.add('falta-info')
        label_nomeT.textContent = RegTurma;
     
        const label_qtdnF = document.createElement('p')
        label_qtdnF.classList.add('falta-info')
        label_qtdnF.textContent = RegNmrF;

        const label_mat = document.createElement('p')
        label_mat.classList.add('falta-info')
        label_mat.textContent = RegNameM;

        const label_prof = document.createElement('p')
        label_prof.classList.add('falta-info')
        label_prof.textContent = RegNameP;


        nameLi.appendChild(label_data);
        nameLi.appendChild(label_nomeA);
        nameLi.appendChild(label_nomeT);
        nameLi.appendChild(label_qtdnF);
        nameLi.appendChild(label_mat);
        nameLi.appendChild(label_prof);
        

        lista.appendChild(nameLi); 
    }
}

async function fontSize() {
    document.addEventListener("DOMContentLoaded", function() {
        const configBtn = document.getElementById("configBtn");
        const configPopup = document.getElementById("configPopup");
        const fontSizeInput = document.getElementById("fontSize");
        const fontSizeValue = document.getElementById("fontSizeValue");
        const applyFontSize = document.getElementById("applyFontSize");
        const closePopup = document.getElementById("closePopup");
        const content = document.querySelector(".content");
    
        configBtn.addEventListener("click", function() {
            configPopup.style.display = "block";
        });
    
        closePopup.addEventListener("click", function() {
            configPopup.style.display = "none";
        });
    
        fontSizeInput.addEventListener("input", function() {
            fontSizeValue.textContent = fontSizeInput.value + "px";
        });
    
        applyFontSize.addEventListener("click", function() {
            const newSize = fontSizeInput.value + "px";
            content.style.fontSize = newSize;
            configPopup.style.display = "none";
        });
    });
}