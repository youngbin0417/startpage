const $home = {
    /**
     * 초기화
     */
    init: function() {
        this.initMobileMenu();
        this.initPageTransition();
        this.initExpandedContent();
    },

    /**
     * 모바일 메뉴 초기화
     */
    initMobileMenu: function() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const closeMenuButton = document.getElementById('closeMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        const menuLinks = document.querySelectorAll('.mobile-menu a');
        const header = document.querySelector('.header');
        let lastScrollTop = 0;
        const scrollThreshold = 50;

        // 스크롤 이벤트 처리
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
        });

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                mobileMenu.classList.add('active');
            });
        }

        if (closeMenuButton && mobileMenu) {
            closeMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                mobileMenu.classList.remove('active');
            });
        }

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });

        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                if (!mobileMenu.contains(e.target) && e.target !== mobileMenuButton) {
                    mobileMenu.classList.remove('active');
                }
            }
        });
    },

    /**
     * 페이지 전환 효과 초기화
     */
    initPageTransition: function() {
        document.querySelectorAll('.page-transition').forEach(element => {
            element.classList.add('active');
        });
    },

    /**
     * 확장된 내용 초기화
     */
    initExpandedContent: function() {
        const expandedContents = {
            card1: {
                title: "HUG 전세보증보험에 가입하고 싶어요.",
                content: `
                    <p class="mb-4 text-base">HUG 전세보증보험은 전세 금액, 저당금액의 합을 감정평가액과 비교하면서 가입여부를 판단합니다. 이를 위해 다음의 방법을 참고해 주세요.</p>
                    <div class="bg-blue-50 p-5 rounded-lg mb-6">
                        <div class="step-item"><div class="step-number bg-blue-600 text-white">1</div><p>먼저, 밸류터치로 추정가와 전세금액, 저당금액을 비교합니다.</p></div>
                        <div class="step-item"><div class="step-number bg-blue-600 text-white">2</div><p>추정가가 전세금액, 저당금액보다 높다면 HUG에 연락해 '감정평가법인감동'의 감정평가서 제출 가능 여부를 확인합니다.</p></div>
                        <div class="step-item"><div class="step-number bg-blue-600 text-white">3</div><p>HUG에서 '감정평가법인감동'의 감정평가서 제출이 가능하다고 안내 받으시면 홈페이지를 통해 HUG 가입용 감정평가서를 요청합니다.</p></div>
                        <div class="step-item mb-0"><div class="step-number bg-blue-600 text-white">4</div><p>감정평가사의 상담과 꼼꼼한 평가를 통해 감정평가서를 작성해 드립니다.</p></div>
                    </div>
                    <div class="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500"><p class="font-medium">밸류터치와 함께 HUG 전세보증보험 가입을 위한 첫 단계를 시작해보세요!</p></div>
                `
            },
            card2: {
                title: "부동산 시세를 확인하고 싶어요.",
                content: `
                    <p class="mb-4 text-base">부동산 시세 확인을 위한 간단한 3단계:</p>
                    <div class="bg-green-50 p-5 rounded-lg mb-6">
                        <div class="step-item"><div class="step-number bg-green-600 text-white">1</div><p>먼저, 밸류터치에 들어가 무료로 로그인합니다.</p></div>
                        <div class="step-item"><div class="step-number bg-green-600 text-white">2</div><p>검색창에 부동산 시세를 알고 싶은 주소를 입력합니다.</p></div>
                        <div class="step-item mb-0"><div class="step-number bg-green-600 text-white">3</div><p>추정가를 통해 부동산 시세를 확인합니다.</p></div>
                    </div>
                    <div class="bg-green-100 p-4 rounded-lg border-l-4 border-green-500"><p class="font-medium">밸류터치의 정확한 시세 정보로 부동산 가치를 확인하세요!</p></div>
                `
            },
            card3: {
                title: "재무구조를 개선하고 싶어요.",
                content: `
                    <p class="mb-4 text-base">재무구조 개선을 위한 단계:</p>
                    <div class="bg-purple-50 p-5 rounded-lg mb-6">
                        <div class="step-item"><div class="step-number bg-purple-600 text-white">1</div><p>먼저, 밸류터치에 무료로 회원가입 후 로그인 합니다.</p></div>
                        <div class="step-item"><div class="step-number bg-purple-600 text-white">2</div><p>그 다음 회사가 소유한 부동산 주소를 검색해 추정가를 확인합니다.</p></div>
                        <div class="step-item mb-0"><div class="step-number bg-purple-600 text-white">3</div><p>감정평가법인감동을 통해 자산재평가를 위한 감정평가서를 발급받습니다.</p></div>
                    </div>
                    <div class="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-500"><p class="font-medium">밸류터치와 함께 더 나은 재무구조를 설계하세요!</p></div>
                `
            },
            card4: {
                title: "세무서에 제출할 감정평가서가 필요해요.",
                content: `
                    <p class="mb-4 text-base">세무서 제출용 감정평가서 발급 과정:</p>
                    <div class="bg-amber-50 p-5 rounded-lg mb-6">
                        <div class="step-item"><div class="step-number bg-amber-600 text-white">1</div><p>먼저, 밸류터치에 무료로 회원가입 후 상속 또는 증여 받으시는 주소를 검색합니다.</p></div>
                        <div class="step-item"><div class="step-number bg-amber-600 text-white">2</div><p>그 다음 추정가를 통해 세무사와 상담합니다.</p></div>
                        <div class="step-item mb-0"><div class="step-number bg-amber-600 text-white">3</div><p>가장 유리한 금액을 확인하고 감정평가법인감동의 감정평가서를 통해 이를 증명합니다.</p></div>
                    </div>
                    <div class="bg-amber-100 p-4 rounded-lg border-l-4 border-amber-500"><p class="font-medium">밸류터치의 정확한 감정평가서로 세무 업무를 효율적으로 처리하세요!</p></div>
                `
            }
        };

        const cards = document.querySelectorAll('.flashcard');
        const expandedContent = document.getElementById('expandedContent');
        const expandedTitle = document.getElementById('expandedTitle');
        const expandedInfo = document.getElementById('expandedInfo');

        cards.forEach(card => {
            card.addEventListener('click', function () {
                const cardId = this.id;
                const content = expandedContents[cardId];

                if (content) {
                    expandedTitle.textContent = content.title;
                    expandedInfo.innerHTML = content.content;
                    expandedContent.classList.remove('hidden');
                }
            });
        });

        // 전역 함수 등록
        window.closeExpandedContent = function() {
            expandedContent.classList.add('hidden');
        };

        window.scrollToPage = function(pageNumber) {
            const page = document.getElementById(`page${pageNumber}`);
            page.scrollIntoView({ behavior: 'smooth' });
        };
    }
};
