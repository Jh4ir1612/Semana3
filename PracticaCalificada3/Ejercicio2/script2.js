document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const participantsTextarea = document.getElementById('participants');
    const splitTypeSelect = document.getElementById('splitType');
    const teamsOptionDiv = document.getElementById('teamsOption');
    const membersOptionDiv = document.getElementById('membersOption');
    const teamCountSelect = document.getElementById('teamCount');
    const membersPerTeamSelect = document.getElementById('membersPerTeam');
    const tournamentTitleInput = document.getElementById('tournamentTitle');
    const clearBtn = document.getElementById('clearBtn');
    const generateBtn = document.getElementById('generateBtn');
    const inputSection = document.getElementById('inputSection');
    const outputSection = document.getElementById('outputSection');
    const resultsTitle = document.getElementById('resultsTitle');
    const teamsContainer = document.getElementById('teamsContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyTeamsBtn = document.getElementById('copyTeamsBtn');
    const copyColumnsBtn = document.getElementById('copyColumnsBtn');
    const backBtn = document.getElementById('backBtn');
    
    // Cambiar entre opciones de división
    splitTypeSelect.addEventListener('change', function() {
        if (this.value === 'teams') {
            teamsOptionDiv.classList.remove('hidden');
            membersOptionDiv.classList.add('hidden');
        } else {
            teamsOptionDiv.classList.add('hidden');
            membersOptionDiv.classList.remove('hidden');
        }
    });
    
    // Limpiar campos
    clearBtn.addEventListener('click', function() {
        participantsTextarea.value = '';
        tournamentTitleInput.value = '';
    });
    
    // Generar equipos
    generateBtn.addEventListener('click', function() {
        const participantsText = participantsTextarea.value.trim();
        const tournamentTitle = tournamentTitleInput.value.trim();
        
        if (!participantsText) {
            alert('Por favor ingresa al menos un participante');
            return;
        }
        
        // Procesar participantes
        let participants = participantsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        // Verificar límites
        if (participants.length > 100) {
            alert('El número máximo de participantes es 100');
            return;
        }
        
        for (const name of participants) {
            if (name.length > 50) {
                alert(`El nombre "${name}" excede el límite de 50 caracteres`);
                return;
            }
        }
        
        // Separar líderes
        const leaders = participants.filter(name => name.startsWith('*'))
            .map(name => name.substring(1).trim());
        participants = participants.filter(name => !name.startsWith('*'))
            .concat(leaders);
        
        // Mezclar participantes aleatoriamente
        shuffleArray(participants);
        
        // Distribuir líderes primero
        const allParticipants = [...leaders, ...participants.filter(name => !leaders.includes(name))];
        
        // Determinar configuración de equipos
        let teams = [];
        const splitType = splitTypeSelect.value;
        
        if (splitType === 'teams') {
            const teamCount = parseInt(teamCountSelect.value);
            teams = distributeParticipants(allParticipants, teamCount);
        } else {
            const membersPerTeam = parseInt(membersPerTeamSelect.value);
            const teamCount = Math.ceil(allParticipants.length / membersPerTeam);
            teams = distributeParticipants(allParticipants, teamCount);
        }
        
        // Mostrar resultados
        showResults(teams, tournamentTitle);
    });
    
    // Volver al inicio
    backBtn.addEventListener('click', function() {
        inputSection.classList.remove('hidden');
        outputSection.classList.add('hidden');
    });
    
    // Copiar equipos al portapapeles
    copyTeamsBtn.addEventListener('click', function() {
        const teams = Array.from(document.querySelectorAll('.team'));
        let textToCopy = '';
        
        teams.forEach((team, index) => {
            textToCopy += `Equipo ${index + 1}:\n`;
            const members = team.querySelectorAll('.team-member');
            members.forEach(member => {
                textToCopy += `- ${member.textContent}\n`;
            });
            textToCopy += '\n';
        });
        
        navigator.clipboard.writeText(textToCopy.trim())
            .then(() => alert('Equipos copiados al portapapeles'))
            .catch(err => alert('Error al copiar: ' + err));
    });
    
    // Copiar en columnas
    copyColumnsBtn.addEventListener('click', function() {
        const teams = Array.from(document.querySelectorAll('.team'));
        const maxMembers = Math.max(...teams.map(team => team.querySelectorAll('.team-member').length));
        let textToCopy = '';
        
        // Encabezados
        teams.forEach((team, index) => {
            textToCopy += `Equipo ${index + 1}\t`;
        });
        textToCopy += '\n';
        
        // Miembros
        for (let i = 0; i < maxMembers; i++) {
            teams.forEach(team => {
                const members = team.querySelectorAll('.team-member');
                textToCopy += (members[i] ? members[i].textContent : '') + '\t';
            });
            textToCopy += '\n';
        }
        
        navigator.clipboard.writeText(textToCopy.trim())
            .then(() => alert('Equipos copiados en columnas'))
            .catch(err => alert('Error al copiar: ' + err));
    });
    
    
    
    // Función para mezclar array aleatoriamente (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Función para distribuir participantes en equipos
    function distributeParticipants(participants, teamCount) {
        const teams = Array.from({ length: teamCount }, () => []);
        
        for (let i = 0; i < participants.length; i++) {
            teams[i % teamCount].push(participants[i]);
        }
        
        return teams;
    }
    
    // Función para mostrar los resultados
    function showResults(teams, tournamentTitle) {
        // Actualizar título
        resultsTitle.textContent = tournamentTitle || 'Resultados del Sorteo';
        
        // Limpiar contenedor
        teamsContainer.innerHTML = '';
        
        // Crear equipos
        teams.forEach((team, index) => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'team-title';
            titleDiv.textContent = `Equipo ${index + 1}`;
            teamDiv.appendChild(titleDiv);
            
            team.forEach((member, memberIndex) => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'team-member';
                if (memberIndex === 0) memberDiv.classList.add('leader');
                memberDiv.textContent = member;
                teamDiv.appendChild(memberDiv);
            });
            
            teamsContainer.appendChild(teamDiv);
        });
        
        // Mostrar sección de resultados
        inputSection.classList.add('hidden');
        outputSection.classList.remove('hidden');
    }
    // Función para mostrar los resultados con animación
function showResults(teams, tournamentTitle) {
    // Actualizar título
    resultsTitle.textContent = tournamentTitle || 'Resultados del Sorteo';
    
    // Limpiar contenedor
    teamsContainer.innerHTML = '';
    
    // Crear equipos con animación
    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'team-title';
        titleDiv.textContent = `Equipo ${index + 1}`;
        teamDiv.appendChild(titleDiv);
        
        // Contenedor para los miembros (lo agregamos vacío)
        const membersContainer = document.createElement('div');
        membersContainer.className = 'team-members';
        teamDiv.appendChild(membersContainer);
        
        teamsContainer.appendChild(teamDiv);
        
        // Animación para mostrar miembros uno por uno
        showMembersWithAnimation(membersContainer, team, index);
    });
    
    // Mostrar sección de resultados
    inputSection.classList.add('hidden');
    outputSection.classList.remove('hidden');
}

// Nueva función para animación de miembros
function showMembersWithAnimation(container, members, teamIndex) {
    // Esperar 500ms antes de empezar la animación para este equipo
    setTimeout(() => {
        members.forEach((member, memberIndex) => {
            // Cada miembro aparece con un pequeño delay
            setTimeout(() => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'team-member';
                if (memberIndex === 0) memberDiv.classList.add('leader');
                
                // Efecto de fade-in
                memberDiv.style.opacity = '0';
                memberDiv.style.transform = 'translateY(10px)';
                memberDiv.style.transition = 'all 0.3s ease';
                
                memberDiv.textContent = member;
                container.appendChild(memberDiv);
                
                // Trigger para la animación
                setTimeout(() => {
                    memberDiv.style.opacity = '1';
                    memberDiv.style.transform = 'translateY(0)';
                }, 50);
                
            }, 300 * memberIndex); // Delay entre miembros
        });
    }, 500 * teamIndex); // Delay inicial entre equipos
}
});