document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // STATE & MOCK DATA
    // =================================================================================

    const USERS = [
        { id: 'u1', name: 'Budi Hartono', avatar: 'https://i.pravatar.cc/150?u=u1' },
        { id: 'u2', name: 'Siti Aminah', avatar: 'https://i.pravatar.cc/150?u=u2' },
        { id: 'u3', name: 'Ahmad Fauzi', avatar: 'https://i.pravatar.cc/150?u=u3' },
        { id: 'u4', name: 'Dewi Lestari', avatar: 'https://i.pravatar.cc/150?u=u4' },
    ];

    const MOCK_PROJECTS = [
        {
            id: 'p1', courseName: 'Pemrograman Web Lanjutan', taskTitle: 'Membangun Aplikasi E-commerce',
            description: 'Proyek akhir semester untuk membangun aplikasi e-commerce full-stack dengan React dan Node.js.',
            mainDeadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            inviteCode: 'WEBDEV123', adminId: 'u1', members: USERS,
            tasks: [
                { id: 't1', title: 'Desain UI/UX Mockup', description: 'Membuat mockup di Figma', assigneeId: 'u2', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), status: "Done", priority: "High" },
                { id: 't2', title: 'Setup Frontend Project', description: 'Inisialisasi project React dengan TypeScript', assigneeId: 'u1', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), status: "In Progress", priority: "High" },
                { id: 't3', title: 'Buat API Endpoint Produk', description: 'Endpoint CRUD untuk produk', assigneeId: null, dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), status: "To-Do", priority: "Medium" },
                { id: 't4', title: 'Implementasi Halaman Utama', description: 'Coding halaman utama sesuai desain', assigneeId: null, dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: "To-Do", priority: "Low" },
            ],
            chat: [
                { id: 'c1', userId: 'u2', text: 'Mockup awal sudah selesai, teman-teman. Silakan dicek di folder file ya.', timestamp: new Date(new Date().getTime() - 86400000).toISOString() },
                { id: 'c2', userId: 'u1', text: 'Keren, @Siti! Saya mulai setup project frontendnya ya.', timestamp: new Date(new Date().getTime() - 86000000).toISOString() },
            ],
            files: [
                { id: 'f1', name: 'Dokumen Spesifikasi.pdf', type: 'pdf', size: '1.2 MB', uploadedBy: 'u1', uploadDate: new Date(new Date().getTime() - 172800000).toISOString() },
                { id: 'f2', name: 'Mockup Final.png', type: 'png', size: '3.4 MB', uploadedBy: 'u2', uploadDate: new Date(new Date().getTime() - 86400000).toISOString() },
                { id: 'f3', name: 'Catatan Rapat.docx', type: 'docx', size: '256 KB', uploadedBy: 'u3', uploadDate: new Date(new Date().getTime() - 86400000).toISOString() },
            ]
        },
        {
            id: 'p2', courseName: 'Kecerdasan Buatan', taskTitle: 'Analisis Sentimen Twitter',
            description: 'Menganalisis sentimen publik terhadap topik tertentu menggunakan data dari Twitter.',
            mainDeadline: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
            inviteCode: 'AI-NLP456', adminId: 'u3', members: [USERS[0], USERS[2], USERS[3]],
            tasks: [
                { id: 't5', title: 'Pengumpulan Data Tweet', description: 'Menggunakan API Twitter', assigneeId: 'u4', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), status: "In Progress", priority: "High" },
                { id: 't6', title: 'Preprocessing Teks', description: 'Pembersihan dan normalisasi data teks', assigneeId: null, dueDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(), status: "To-Do", priority: "Medium" },
            ],
            chat: [], files: []
        },
    ];
    
    // Application State
    let state = {
        projects: JSON.parse(localStorage.getItem('kolaboraProjects')) || MOCK_PROJECTS,
        users: USERS,
        currentUser: USERS[0],
        selectedProjectId: null,
        isDarkMode: localStorage.getItem('kolaboraTheme') === 'dark',
        userMap: new Map(USERS.map(u => [u.id, u])),
    };
    
    // DOM Elements
    const headerEl = document.getElementById('app-header');
    const mainEl = document.getElementById('app-main');
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // =================================================================================
    // HELPER FUNCTIONS
    // =================================================================================

    const saveState = () => {
        localStorage.setItem('kolaboraProjects', JSON.stringify(state.projects));
        localStorage.setItem('kolaboraTheme', state.isDarkMode ? 'dark' : 'light');
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const daysLeft = (dateString) => {
        const diff = new Date(dateString).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days < 0) return 'Terlewat';
        if (days === 0) return 'Hari ini';
        if (days === 1) return 'Besok';
        return `${days} hari lagi`;
    };

    const daysLeftNumeric = (dateString) => {
        const diff = new Date(dateString).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    // Icons mapping
    const ICONS = {
        dashboard: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />`,
        tasks: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h.75v.75h-.75V7.5zM6.75 10.5h.75v.75h-.75v-.75zM6.75 13.5h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM4.5 6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08M5.25 8.25h.008v.008H5.25zM5.25 11.25h.008v.008H5.25zM5.25 14.25h.008v.008H5.25zM5.25 17.25h.008v.008H5.25z" />`,
        chat: `<path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25c0-4.556-3.694-8.25-8.25-8.25S4.5 6.694 4.5 11.25s3.694 8.25 8.25 8.25c.828 0 1.626-.123 2.375-.352L18.75 21l-1.35-2.43a8.203 8.203 0 001.6-4.32z" />`,
        files: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />`,
        calendar: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />`,
        plus: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />`,
        logout: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />`,
        clipboard: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612 0 .662-.538 1.2-1.2 1.2h-3c-.662 0-1.2-.538-1.2-1.2 0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.2185a48.208 48.208 0 011.927-.184" />`,
        ellipsis: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />`,
        user: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />`,
        cog: `<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.223 1.19-.223 1.745 0 .55.223 1.02.684 1.11 1.226l.082.499a.953.953 0 001.32.796l.462-.202c.516-.224 1.114-.046 1.488.42l.049.062c.41.482.496 1.14.224 1.656l-.202.462a.953.953 0 00.796 1.32l.499.082c.542.09.997.554 1.226 1.11.223.554.223 1.19 0 1.745-.223.555-.684 1.02-1.226 1.11l-.499.082a.953.953 0 00-.796 1.32l.202.462c.273.516.192 1.174-.224 1.656l-.049.062c-.374.466-.972.644-1.488.42l-.462-.202a.953.953 0 00-1.32.796l-.082.499c-.09.542-.56 1.003-1.11 1.226-.554-.223-1.19-.223-1.745 0-.55-.223-1.02-.684-1.11-1.226l-.082-.499a.953.953 0 00-1.32-.796l-.462.202c-.516.224-1.114-.046-1.488-.42l-.049-.062c-.41-.482-.496-1.14-.224-1.656l.202.462a.953.953 0 00-.796-1.32l-.499-.082c-.542-.09-.997-.554-1.226-1.11-.223-.554-.223-1.19 0 1.745.223-.555.684 1.02 1.226-1.11l.499-.082a.953.953 0 00.796-1.32l-.202-.462c-.273-.516-.192-1.174.224-1.656l.049-.062c.374-.466.972.644-1.488-.42l.462.202a.953.953 0 001.32-.796l.082-.499z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`,
        check: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />`,
        'arrow-uturn-left': `<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />`,
        'file-pdf': `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />`,
        'file-doc': `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />`,
        'file-image': `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />`,
    };
    const Icon = (name, className = "w-6 h-6") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}">${ICONS[name] || ''}</svg>`;
    
    const getFileIconName = (type) => {
        switch (type) {
            case 'pdf': return 'file-pdf';
            case 'png': return 'file-image';
            case 'docx': return 'file-doc';
            case 'folder': return 'files';
            default: return 'file-doc';
        }
    };
    
    // =================================================================================
    // MODAL HANDLERS
    // =================================================================================

    const openModal = (title, bodyHtml, onOpen = () => {}) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalContainer.classList.remove('hidden');
        onOpen();
    };

    const closeModal = () => {
        modalContainer.classList.add('hidden');
        modalBody.innerHTML = '';
    };

    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) closeModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    
    // =================================================================================
    // COMPONENT TEMPLATES
    // =================================================================================
    
    const HeaderComponent = () => {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        ${state.selectedProjectId ? `
                             <button id="back-to-dashboard-btn" class="mr-4 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                             </button>
                        ` : ''}
                        <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">Kolabora</h1>
                    </div>
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <div id="user-menu-container" class="relative">
                            <button id="user-menu-btn" class="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <img class="w-10 h-10 rounded-full" src="${state.currentUser.avatar}" alt="${state.currentUser.name}" />
                                <span class="hidden sm:block text-slate-700 dark:text-slate-300 font-medium">${state.currentUser.name}</span>
                            </button>
                             <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1" role="menu">
                                <button id="profile-btn" class="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem">
                                    ${Icon('user', 'w-5 h-5 mr-3')} Profil Saya
                                </button>
                                <button id="settings-btn" class="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem">
                                    ${Icon('cog', 'w-5 h-5 mr-3')} Pengaturan
                                </button>
                                <div class="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                <button class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem">
                                    ${Icon('logout', 'w-5 h-5 mr-3')} Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const ProjectCardComponent = (project) => {
        const completedTasks = project.tasks.filter(t => t.status === "Done").length;
        const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;
        const isUserAdmin = project.adminId === state.currentUser.id;

        const daysRemaining = daysLeftNumeric(project.mainDeadline);
        let borderColor = 'border-primary-500';
        let textColor = 'text-primary-500';
        if (daysRemaining < 7) {
            borderColor = 'border-red-500';
            textColor = 'text-red-500';
        } else if (daysRemaining < 14) {
            borderColor = 'border-amber-500';
            textColor = 'text-amber-500';
        }

        return `
            <div class="project-card bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all relative border-t-4 ${borderColor}" data-project-id="${project.id}">
                ${isUserAdmin ? `
                    <div class="project-menu-container absolute top-3 right-3 z-10">
                        <button class="project-menu-btn p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Project options" data-project-id="${project.id}">
                            ${Icon('ellipsis', 'w-5 h-5')}
                        </button>
                        <div class="project-menu-dropdown hidden absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5" role="menu">
                            <div class="py-1">
                                <button class="edit-project-btn w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem" data-project-id="${project.id}">
                                    Edit Proyek
                                </button>
                                <button class="delete-project-btn w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem" data-project-id="${project.id}">
                                    Hapus Proyek
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <div class="p-6 cursor-pointer project-card-main">
                    <div class="uppercase tracking-wide text-sm text-primary-500 dark:text-primary-400 font-semibold">${project.courseName}</div>
                    <h2 class="block mt-1 text-lg leading-tight font-bold text-slate-900 dark:text-white">${project.taskTitle}</h2>
                    <p class="mt-2 text-slate-500 dark:text-slate-400 h-10">${project.description}</p>
                    <div class="mt-4">
                        <div class="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                            <span>Progress</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                            <div class="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-between items-end">
                         <div class="flex -space-x-3 overflow-hidden">
                            ${project.members.slice(0, 4).map(member => `
                                <img class="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-800" src="${member.avatar}" alt="${member.name}" title="${member.name}">
                            `).join('')}
                            ${project.members.length > 4 ? `
                                 <div class="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800">
                                    +${project.members.length - 4}
                                </div>
                            ` : ''}
                        </div>
                         <div class="text-sm font-bold ${textColor}">
                            <span class='block text-right'>${daysLeft(project.mainDeadline)}</span>
                            <span class='block text-xs font-medium text-slate-500 dark:text-slate-400 text-right'>Deadline</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    const TaskCardComponent = (task) => {
        const user = state.userMap.get(task.assigneeId);
        const priorityConfig = {
            High: { color: 'bg-red-500', text: 'Tinggi' },
            Medium: { color: 'bg-amber-500', text: 'Sedang' },
            Low: { color: 'bg-sky-500', text: 'Rendah' },
        };
        const config = priorityConfig[task.priority] || priorityConfig.Low;

        return `
            <div class="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-600 relative">
                 <div class="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${config.color}">${config.text}</div>
                <h4 class="font-semibold text-slate-800 dark:text-slate-100 pr-16">${task.title}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">${task.description}</p>
                <div class="flex justify-between items-center mt-4">
                    ${user ? `
                         <div class="flex items-center space-x-2" title="Ditugaskan kepada ${user.name}">
                             <img src="${user.avatar}" alt="${user.name}" class="w-7 h-7 rounded-full" />
                             <span class="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:block">${user.name}</span>
                         </div>
                    ` : `<div class="text-xs text-slate-400 italic">Belum ditugaskan</div>`}
                    <span class="text-xs font-semibold text-red-500 whitespace-nowrap">${daysLeft(task.dueDate)}</span>
                </div>
            </div>
        `;
    };
    
    // =================================================================================
    // SCREEN RENDERERS
    // =================================================================================

    const renderDashboardScreen = () => {
        const userProjects = state.projects.filter(p => p.members.some(m => m.id === state.currentUser.id));
        mainEl.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h2 class="text-2xl text-slate-600 dark:text-slate-400">Selamat datang kembali,</h2>
                    <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100">${state.currentUser.name}!</h1>
                </div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Proyek Anda</h2>
                    <div class="flex space-x-2">
                         <button id="join-project-btn" class="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                            Gabung Proyek
                        </button>
                        <button id="create-project-btn" class="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center">
                            ${Icon('plus', 'w-5 h-5 mr-2')} Buat Proyek
                        </button>
                    </div>
                </div>
                <div id="project-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${userProjects.map(ProjectCardComponent).join('')}
                </div>
            </div>
        `;
        attachDashboardListeners();
    };

    const renderProjectScreen = () => {
        const project = state.projects.find(p => p.id === state.selectedProjectId);
        if (!project) {
            handleBackToDashboard();
            return;
        }

        const navItems = [
            { id: 'dashboard', name: 'Dasbor', icon: 'dashboard' },
            { id: 'tasks', name: 'Papan Tugas', icon: 'tasks' },
            { id: 'chat', name: 'Ruang Diskusi', icon: 'chat' },
            { id: 'files', name: 'Penyimpanan Berkas', icon: 'files' },
            { id: 'calendar', name: 'Kalender Tim', icon: 'calendar' },
        ];

        mainEl.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:space-x-8">
                <nav class="w-full md:w-64 flex-shrink-0">
                    <div class="sticky top-24">
                         <ul class="flex space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:flex-col pb-2">
                            ${navItems.map(item => `
                                <li>
                                    <a href="#" class="project-nav-link flex-shrink-0 flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" data-view="${item.id}">
                                        ${Icon(item.icon, 'w-5 h-5 mr-3')} ${item.name}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </nav>
                <div id="project-view-content" class="flex-1 mt-6 md:mt-0">
                    <!-- Project view content will be rendered here -->
                </div>
            </div>
        `;
        
        attachProjectScreenListeners();
        renderProjectView('dashboard'); // Initial view
    };
    
    const renderProjectView = (view) => {
        const project = state.projects.find(p => p.id === state.selectedProjectId);
        const contentEl = document.getElementById('project-view-content');
        if (!contentEl || !project) return;
        
        // Update active nav link
        document.querySelectorAll('.project-nav-link').forEach(link => {
            link.classList.toggle('bg-primary-100', link.dataset.view === view);
            link.classList.toggle('dark:bg-primary-900/50', link.dataset.view === view);
            link.classList.toggle('text-primary-700', link.dataset.view === view);
            link.classList.toggle('dark:text-primary-300', link.dataset.view === view);
            
            link.classList.toggle('text-slate-600', link.dataset.view !== view);
            link.classList.toggle('dark:text-slate-300', link.dataset.view !== view);
        });

        switch(view) {
            case 'dashboard':
                const upcomingTasks = project.tasks
                    .filter(t => t.status !== "Done")
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 5);

                contentEl.innerHTML = `
                    <div>
                        <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">${project.taskTitle}</h2>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">${project.courseName}</p>
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div class="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Deadline Utama</h3>
                                <p class="text-2xl font-bold text-red-500 mt-2">${formatDate(project.mainDeadline)}</p>
                                <p class="text-slate-500 dark:text-slate-400">${daysLeft(project.mainDeadline)}</p>
                            </div>
                             <div class="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Anggota Tim</h3>
                                <div class="flex flex-wrap gap-2 mt-3">
                                    ${project.members.map(member => `
                                        <div class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-full p-1 pr-3">
                                            <img src="${member.avatar}" alt="${member.name}" class="w-7 h-7 rounded-full" />
                                            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                ${member.name}
                                                ${member.id === project.adminId ? `<span class="text-xs text-primary-600 dark:text-primary-400 ml-1.5 font-semibold">(Pemilik)</span>` : ''}
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Notifikasi</h3>
                                <ul class="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    <li>Siti Aminah menyelesaikan tugas "Desain UI/UX Mockup".</li>
                                    <li>Ahmad Fauzi ditugaskan "Buat API Endpoint Produk".</li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-8 bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tugas Mendekati Deadline</h3>
                            <ul class="space-y-3">
                                ${upcomingTasks.map(task => `
                                    <li class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                        <div>
                                            <p class="font-semibold text-slate-800 dark:text-slate-200">${task.title}</p>
                                            <p class="text-sm text-slate-500 dark:text-slate-400">
                                                Ditugaskan kepada ${task.assigneeId ? state.userMap.get(task.assigneeId)?.name : 'Belum ada'}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-semibold text-red-500">${formatDate(task.dueDate)}</p>
                                            <p class="text-sm text-slate-500 dark:text-slate-400">${daysLeft(task.dueDate)}</p>
                                        </div>
                                    </li>
                                `).join('')}
                                ${!upcomingTasks.length ? `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Tidak ada tugas yang mendekati deadline.</p>` : ''}
                            </ul>
                        </div>
                    </div>
                `;
                break;
            case 'tasks':
                const tasksByStatus = {
                    "To-Do": project.tasks.filter(t => t.status === "To-Do").sort((a,b) => (b.priority > a.priority) ? 1 : ((a.priority > b.priority) ? -1 : 0)),
                    "In Progress": project.tasks.filter(t => t.status === "In Progress"),
                    "Done": project.tasks.filter(t => t.status === "Done"),
                };
                const isUserAdmin = state.currentUser.id === project.adminId;
                
                contentEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Papan Tugas</h2>
                            <button class="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center">
                                ${Icon('plus', 'w-5 h-5 mr-2')} Tambah Tugas
                            </button>
                        </div>
                        <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            ${Object.keys(tasksByStatus).map(status => `
                                <div class="bg-slate-100 dark:bg-slate-900/70 rounded-xl p-3 w-full md:w-80 flex-shrink-0">
                                    <h3 class="font-bold text-lg text-slate-700 dark:text-slate-200 mb-4 px-2 flex justify-between items-center">
                                        <span>${status}</span>
                                        <span class="text-sm bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2.5 py-0.5">${tasksByStatus[status].length}</span>
                                    </h3>
                                    <div class="task-column-body space-y-3 h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                                        ${tasksByStatus[status].map(task => `
                                            <div class="group" data-task-id="${task.id}">
                                                ${TaskCardComponent(task)}
                                                ${status === 'To-Do' ? `
                                                    <div class="mt-2 text-sm">
                                                        ${isUserAdmin ? `
                                                            <div class="flex items-center space-x-2">
                                                                <select class="assign-task-select block w-full text-xs rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 p-2" data-task-id="${task.id}">
                                                                    ${project.members.map(m => `<option value="${m.id}" ${task.assigneeId === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
                                                                </select>
                                                                <button class="assign-task-btn flex-shrink-0 text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400 px-3 py-2 rounded-md transition-colors" data-task-id="${task.id}">
                                                                    ${task.assigneeId ? "Ubah" : "Tugas"}
                                                                </button>
                                                            </div>
                                                        ` : (!task.assigneeId ? `
                                                            <button class="take-task-btn w-full text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 py-2 px-3 rounded-md transition-colors" data-task-id="${task.id}">
                                                                Kerjakan Tugas
                                                            </button>
                                                        ` : '')}
                                                    </div>
                                                ` : ''}
                                                ${status === 'In Progress' ? `
                                                    <div class="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button class="change-status-btn flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded" data-task-id="${task.id}" data-status="To-Do" title="Kembalikan ke To-Do">
                                                            ${Icon('arrow-uturn-left', 'w-4 h-4')} <span>Kembali</span>
                                                        </button>
                                                        <button class="change-status-btn flex items-center space-x-1 text-xs font-semibold text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400 p-1 rounded" data-task-id="${task.id}" data-status="Done" title="Tandai Selesai">
                                                            ${Icon('check', 'w-4 h-4')} <span>Selesai</span>
                                                        </button>
                                                    </div>
                                                `: ''}
                                                ${status === 'Done' ? `
                                                    <div class="flex justify-start items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                         <button class="change-status-btn flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded" data-task-id="${task.id}" data-status="In Progress" title="Buka kembali tugas">
                                                            ${Icon('arrow-uturn-left', 'w-4 h-4')} <span>Buka Lagi</span>
                                                        </button>
                                                    </div>
                                                `: ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                attachTaskBoardListeners();
                break;
            case 'chat':
                contentEl.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-lg shadow h-[calc(100vh-12rem)] flex flex-col">
                        <div class="p-4 border-b dark:border-slate-700">
                            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Ruang Diskusi</h2>
                        </div>
                        <div class="flex-1 p-4 overflow-y-auto space-y-4">
                            ${project.chat.map(msg => {
                                const user = state.userMap.get(msg.userId);
                                const isCurrentUserMsg = msg.userId === state.currentUser.id;
                                return `
                                    <div class="flex items-start gap-3 ${isCurrentUserMsg ? 'justify-end' : ''}">
                                        ${!isCurrentUserMsg && user ? `<img src="${user.avatar}" alt="${user.name}" class="w-9 h-9 rounded-full" />` : ''}
                                        <div class="max-w-md p-3 rounded-lg ${isCurrentUserMsg ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}">
                                            ${!isCurrentUserMsg && user ? `<p class="font-semibold text-sm mb-1 text-primary-600 dark:text-primary-400">${user.name}</p>` : ''}
                                            <p>${msg.text}</p>
                                            <p class="text-xs mt-1 ${isCurrentUserMsg ? 'text-primary-200' : 'text-slate-400'}">${new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</p>
                                        </div>
                                        ${isCurrentUserMsg && user ? `<img src="${user.avatar}" alt="${user.name}" class="w-9 h-9 rounded-full" />` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="p-4 border-t dark:border-slate-700">
                            <div class="relative">
                                <input type="text" placeholder="Ketik pesan Anda..." class="w-full bg-slate-100 dark:bg-slate-700 rounded-lg py-2 pl-4 pr-12 border-transparent focus:ring-primary-500 focus:border-primary-500" />
                                <button class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'files':
                 contentEl.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Penyimpanan Berkas</h2>
                            <button class="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-colors">Unggah Berkas</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">Nama Berkas</th>
                                        <th scope="col" class="px-6 py-3">Ukuran</th>
                                        <th scope="col" class="px-6 py-3">Diupload Oleh</th>
                                        <th scope="col" class="px-6 py-3">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${project.files.map(file => `
                                        <tr class="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div class="flex items-center">
                                                    ${Icon(getFileIconName(file.type), "w-5 h-5 mr-3 text-slate-500 flex-shrink-0")}
                                                    <span>${file.name}</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">${file.size}</td>
                                            <td class="px-6 py-4">${state.userMap.get(file.uploadedBy)?.name || 'Tidak diketahui'}</td>
                                            <td class="px-6 py-4">${formatDate(file.uploadDate)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 `;
                break;
            case 'calendar':
                contentEl.innerHTML = `
                     <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                         <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Kalender Tim</h2>
                         <ul class="space-y-4">
                             <li class="flex items-start space-x-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                 ${Icon('calendar', "w-6 h-6 text-red-600 dark:text-red-400 mt-1")}
                                <div>
                                    <h3 class="font-bold text-red-800 dark:text-red-200">DEADLINE UTAMA PROYEK</h3>
                                    <p class="text-red-600 dark:text-red-300">${project.taskTitle}</p>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${formatDate(project.mainDeadline)}</p>
                                </div>
                            </li>
                             ${project.tasks.map(task => `
                                 <li class="flex items-start space-x-4 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg border-l-4 border-primary-500">
                                     ${Icon('tasks', "w-6 h-6 text-primary-600 dark:text-primary-400 mt-1")}
                                    <div>
                                        <h3 class="font-bold text-primary-800 dark:text-primary-200">Deadline Tugas</h3>
                                        <p class="text-primary-600 dark:text-primary-300">${task.title}</p>
                                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${formatDate(task.dueDate)}</p>
                                    </div>
                                </li>
                             `).join('')}
                         </ul>
                    </div>
                `;
                break;
        }
    };

    // =================================================================================
    // EVENT HANDLERS
    // =================================================================================

    const handleBackToDashboard = () => {
        state.selectedProjectId = null;
        render();
    };

    const handleSelectProject = (projectId) => {
        state.selectedProjectId = projectId;
        render();
    };
    
    const handleCreateProject = (projectData) => {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newProject = {
            ...projectData,
            id: `p${Date.now()}`,
            inviteCode: inviteCode,
            adminId: state.currentUser.id,
            members: [state.currentUser],
            tasks: [], chat: [], files: [],
        };
        state.projects.push(newProject);
        closeModal();
        render();

        const bodyHtml = `
            <div class="p-6 text-center">
                <p class="text-slate-600 dark:text-slate-300 mb-4">Bagikan kode berikut kepada teman-teman Anda untuk mengundang mereka ke proyek:</p>
                <div class="flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <span id="invite-code-text" class="text-2xl font-bold tracking-widest text-primary-600 dark:text-primary-400">${inviteCode}</span>
                    <button id="copy-code-btn" class="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        ${Icon('clipboard', 'w-6 h-6')}
                    </button>
                </div>
                <p id="copied-feedback" class="text-sm text-green-500 mt-2 hidden">Kode disalin!</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 flex justify-end rounded-b-lg">
                <button type="button" class="modal-confirm-btn w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:w-auto sm:text-sm">Selesai</button>
            </div>`;
        openModal('Proyek Berhasil Dibuat!', bodyHtml, () => {
            document.querySelector('.modal-confirm-btn').addEventListener('click', closeModal);
            document.getElementById('copy-code-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(inviteCode).then(() => {
                    const btn = document.getElementById('copy-code-btn');
                    const feedback = document.getElementById('copied-feedback');
                    btn.innerHTML = Icon('check', 'w-6 h-6 text-green-500');
                    feedback.classList.remove('hidden');
                    setTimeout(() => {
                        btn.innerHTML = Icon('clipboard', 'w-6 h-6');
                        feedback.classList.add('hidden');
                    }, 2000);
                });
            });
        });
    };
    
    const handleJoinProject = (inviteCode) => {
        const projectToJoin = state.projects.find(p => p.inviteCode.toUpperCase() === inviteCode.toUpperCase());
        if (!projectToJoin) return false;

        const isAlreadyMember = projectToJoin.members.some(m => m.id === state.currentUser.id);
        if (isAlreadyMember) return false;

        projectToJoin.members.push(state.currentUser);
        closeModal();
        render();
        return true;
    };
    
    const handleEditProject = (projectId, projectData) => {
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex > -1) {
            state.projects[projectIndex] = { ...state.projects[projectIndex], ...projectData };
        }
        closeModal();
        render();
    };

    const handleDeleteProject = (projectId) => {
        state.projects = state.projects.filter(p => p.id !== projectId);
        if (state.selectedProjectId === projectId) {
            state.selectedProjectId = null;
        }
        closeModal();
        render();
    };
    
    const handleUpdateProfile = (newName) => {
        // This is a mock update. In a real app, this would be more complex.
        state.currentUser.name = newName;
        state.users.find(u => u.id === state.currentUser.id).name = newName;
        // Update user name in all projects
        state.projects.forEach(p => {
            const member = p.members.find(m => m.id === state.currentUser.id);
            if(member) member.name = newName;
        });
        closeModal();
        render();
    };
    
    const handleTaskStatusChange = (taskId, newStatus) => {
        const project = state.projects.find(p => p.id === state.selectedProjectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.status = newStatus;
        renderProjectView('tasks');
    };

    const handleAssignTask = (taskId, assigneeId) => {
        const project = state.projects.find(p => p.id === state.selectedProjectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.assigneeId = assigneeId;
        task.status = "In Progress";
        renderProjectView('tasks');
    };

    const toggleDarkMode = () => {
        state.isDarkMode = !state.isDarkMode;
        updateTheme();
        saveState();
    };
    
    // =================================================================================
    // EVENT LISTENER ATTACHMENT
    // =================================================================================
    
    function attachGlobalListeners() {
        document.body.addEventListener('click', (e) => {
            // Close open menus when clicking outside
            if (!e.target.closest('#user-menu-container')) {
                document.getElementById('user-menu-dropdown')?.classList.add('hidden');
            }
            document.querySelectorAll('.project-menu-container').forEach(container => {
                if (!container.contains(e.target)) {
                    container.querySelector('.project-menu-dropdown')?.classList.add('hidden');
                }
            });
        });
    }

    function attachHeaderListeners() {
        const backBtn = document.getElementById('back-to-dashboard-btn');
        if (backBtn) backBtn.addEventListener('click', handleBackToDashboard);

        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        userMenuBtn.addEventListener('click', () => {
            userMenuDropdown.classList.toggle('hidden');
        });
        
        document.getElementById('profile-btn').addEventListener('click', showProfileModal);
        document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
    }
    
    function attachDashboardListeners() {
        document.getElementById('create-project-btn').addEventListener('click', showCreateProjectModal);
        document.getElementById('join-project-btn').addEventListener('click', showJoinProjectModal);
        
        document.querySelectorAll('.project-card').forEach(card => {
            const projectId = card.dataset.projectId;
            const project = state.projects.find(p => p.id === projectId);
            
            card.querySelector('.project-card-main').addEventListener('click', () => handleSelectProject(projectId));
            
            const menuBtn = card.querySelector('.project-menu-btn');
            const dropdown = card.querySelector('.project-menu-dropdown');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close other dropdowns first
                    document.querySelectorAll('.project-menu-dropdown').forEach(d => {
                        if (d !== dropdown) d.classList.add('hidden');
                    });
                    dropdown.classList.toggle('hidden');
                });
            }

            const editBtn = card.querySelector('.edit-project-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEditProjectModal(project);
                });
            }
            
            const deleteBtn = card.querySelector('.delete-project-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showDeleteConfirmationModal(project);
                });
            }
        });
    }
    
    function attachProjectScreenListeners() {
        document.querySelectorAll('.project-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderProjectView(link.dataset.view);
            });
        });
    }
    
    function attachTaskBoardListeners() {
        document.querySelectorAll('.change-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleTaskStatusChange(btn.dataset.taskId, btn.dataset.status);
            });
        });
        document.querySelectorAll('.take-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleAssignTask(btn.dataset.taskId, state.currentUser.id);
            });
        });
        document.querySelectorAll('.assign-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.dataset.taskId;
                const selectEl = document.querySelector(`.assign-task-select[data-task-id="${taskId}"]`);
                handleAssignTask(taskId, selectEl.value);
            });
        });
    }
    
    // =================================================================================
    // MODAL CONTENT AND SHOW FUNCTIONS
    // =================================================================================
    
    const showCreateProjectModal = () => {
        const bodyHtml = `
            <form id="create-project-form">
                <div class="p-6 space-y-4">
                    <div>
                        <label for="courseName" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Mata Kuliah</label>
                        <input type="text" id="courseName" name="courseName" required class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label for="taskTitle" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Tugas</label>
                        <input type="text" id="taskTitle" name="taskTitle" required class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi Singkat</label>
                        <textarea id="description" name="description" rows="3" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700"></textarea>
                    </div>
                     <div>
                        <label for="mainDeadline" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline Akhir</label>
                        <input type="date" id="mainDeadline" name="mainDeadline" required class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700" />
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">Buat Proyek</button>
                    <button type="button" class="modal-cancel-btn mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </form>
        `;
        openModal('Buat Proyek Baru', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('create-project-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const projectData = {
                    courseName: formData.get('courseName'),
                    taskTitle: formData.get('taskTitle'),
                    description: formData.get('description'),
                    mainDeadline: new Date(formData.get('mainDeadline')).toISOString(),
                };
                handleCreateProject(projectData);
            });
        });
    };
    
    const showJoinProjectModal = () => {
        const bodyHtml = `
            <form id="join-project-form">
                <div class="p-6">
                    <label for="inviteCode" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Kode Undangan</label>
                    <input type="text" id="inviteCode" name="inviteCode" required class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 uppercase" placeholder="XXXXXX" />
                    <p id="join-error" class="text-sm text-red-500 mt-2 hidden"></p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">Gabung</button>
                    <button type="button" class="modal-cancel-btn mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </form>
        `;
        openModal('Gabung Proyek', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('join-project-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const code = e.target.inviteCode.value;
                const errorEl = document.getElementById('join-error');
                const success = handleJoinProject(code);
                if (!success) {
                    errorEl.textContent = 'Kode tidak valid atau Anda sudah menjadi anggota proyek ini.';
                    errorEl.classList.remove('hidden');
                }
            });
        });
    };
    
    const showEditProjectModal = (project) => {
         const bodyHtml = `
            <form id="edit-project-form" data-project-id="${project.id}">
                <div class="p-6 space-y-4">
                    <div>
                        <label for="editCourseName" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Mata Kuliah</label>
                        <input type="text" id="editCourseName" name="courseName" required value="${project.courseName}" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label for="editTaskTitle" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Tugas</label>
                        <input type="text" id="editTaskTitle" name="taskTitle" required value="${project.taskTitle}" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label for="editDescription" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi Singkat</label>
                        <textarea id="editDescription" name="description" rows="3" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700">${project.description}</textarea>
                    </div>
                     <div>
                        <label for="editMainDeadline" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline Akhir</label>
                        <input type="date" id="editMainDeadline" name="mainDeadline" required value="${new Date(project.mainDeadline).toISOString().split('T')[0]}" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700" />
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">Simpan Perubahan</button>
                    <button type="button" class="modal-cancel-btn mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </form>
        `;
        openModal('Edit Proyek', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('edit-project-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const projectData = {
                    courseName: formData.get('courseName'),
                    taskTitle: formData.get('taskTitle'),
                    description: formData.get('description'),
                    mainDeadline: new Date(formData.get('mainDeadline')).toISOString(),
                };
                handleEditProject(project.id, projectData);
            });
        });
    };
    
    const showDeleteConfirmationModal = (project) => {
        const bodyHtml = `
            <div class="p-6">
                <p class="text-slate-600 dark:text-slate-300">
                    Apakah Anda yakin ingin menghapus proyek <span class="font-bold text-slate-800 dark:text-slate-100">${project.taskTitle}</span>? Tindakan ini tidak dapat diurungkan.
                </p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button id="confirm-delete-btn" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Hapus
                </button>
                <button type="button" class="modal-cancel-btn mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">
                    Batal
                </button>
            </div>
        `;
        openModal('Hapus Proyek', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('confirm-delete-btn').addEventListener('click', () => {
                handleDeleteProject(project.id);
            });
        });
    };
    
    const showProfileModal = () => {
        const bodyHtml = `
            <form id="profile-form">
                <div class="p-6 space-y-4">
                    <div class="flex items-center space-x-4">
                        <img src="${state.currentUser.avatar}" alt="${state.currentUser.name}" class="w-16 h-16 rounded-full" />
                        <div>
                            <label for="userName" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                            <input type="text" id="userName" name="userName" required value="${state.currentUser.name}" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700" />
                        </div>
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">Simpan</button>
                    <button type="button" class="modal-cancel-btn mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </form>
        `;
        openModal('Profil Saya', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('profile-form').addEventListener('submit', (e) => {
                e.preventDefault();
                handleUpdateProfile(e.target.userName.value);
            });
        });
    };
    
    const showSettingsModal = () => {
        const bodyHtml = `
            <div class="p-6">
                <div class="flex justify-between items-center">
                    <span class="font-medium text-slate-700 dark:text-slate-300">Mode Gelap</span>
                    <button id="dark-mode-toggle" class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${state.isDarkMode ? 'bg-primary-600' : 'bg-slate-300'}">
                        <span class="inline-block w-5 h-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${state.isDarkMode ? 'translate-x-5' : 'translate-x-0'}"></span>
                    </button>
                </div>
            </div>
             <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 flex justify-end rounded-b-lg">
                <button type="button" class="modal-cancel-btn rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:text-sm">
                    Tutup
                </button>
            </div>
        `;
        openModal('Pengaturan', bodyHtml, () => {
            document.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
            document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
        });
    };

    // =================================================================================
    // INITIALIZATION & RENDER
    // =================================================================================

    const render = () => {
        saveState();
        headerEl.className = "bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg sticky top-0 z-20 shadow-sm";
        headerEl.innerHTML = HeaderComponent();
        
        if (state.selectedProjectId) {
            renderProjectScreen();
        } else {
            renderDashboardScreen();
        }
        
        attachHeaderListeners();
    };

    const updateTheme = () => {
        if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // If settings modal is open, update its toggle
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.classList.toggle('bg-primary-600', state.isDarkMode);
            toggle.classList.toggle('bg-slate-300', !state.isDarkMode);
            toggle.querySelector('span').classList.toggle('translate-x-5', state.isDarkMode);
            toggle.querySelector('span').classList.toggle('translate-x-0', !state.isDarkMode);
        }
    };
    
    function init() {
        updateTheme();
        attachGlobalListeners();
        render();
    }
    
    init();
});
