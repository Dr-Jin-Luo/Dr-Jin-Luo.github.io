

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'selected-works', 'news', 'publications', 'awards']

const translations = {
    zh: {
        'nav-home': '主页',
        'nav-selected-works': '代表工作',
        'nav-news': '动态',
        'nav-publications': '学术论文',
        'nav-awards': '获奖',
        'section-selected-works': '代表工作',
        'section-news': '动态',
        'section-publications': '学术论文',
        'section-awards': '获奖',
        'scholar-link': '谷歌学术',
        'loading': '内容加载中...'
    },
    en: {
        'nav-home': 'Home',
        'nav-selected-works': 'Selected Works',
        'nav-news': 'News',
        'nav-publications': 'Academic Papers',
        'nav-awards': 'Awards',
        'section-selected-works': 'Selected Works',
        'section-news': 'News',
        'section-publications': 'Academic Papers',
        'section-awards': 'Awards',
        'scholar-link': 'Google Scholar',
        'loading': 'Loading...'
    }
}

function currentLanguage() {
    const params = new URLSearchParams(window.location.search)
    const queryLang = params.get('lang')
    const storedLang = localStorage.getItem('homepage-lang')
    return ['zh', 'en'].includes(queryLang) ? queryLang : (['zh', 'en'].includes(storedLang) ? storedLang : 'zh')
}

function updateStaticText(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n')
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key]
        }
    })
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang)
    })
}

function loadConfig(lang) {
    return fetch(content_dir + lang + '/' + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text)
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key]
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }
            })
        })
}

function loadSections(lang) {
    marked.use({ mangle: false, headerIds: false })
    return Promise.all(section_names.map(name => {
        const target = document.getElementById(name + '-md')
        if (target) {
            target.innerHTML = '<p class="loading-text">' + translations[lang].loading + '</p>'
        }
        return fetch(content_dir + lang + '/' + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown)
                document.getElementById(name + '-md').innerHTML = html
            })
    })).then(() => {
        if (window.MathJax) {
            MathJax.typeset()
        }
    })
}

function setLanguage(lang) {
    localStorage.setItem('homepage-lang', lang)
    updateStaticText(lang)
    loadConfig(lang).catch(error => console.log(error))
    loadSections(lang).catch(error => console.log(error))
}


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang)
        })
    })

    setLanguage(currentLanguage())

}); 
