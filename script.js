// 수평 스크롤 슬라이드 기능
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.horizontal-scroll-container');
    const indicators = document.querySelectorAll('.indicator-dot');
    const slides = document.querySelectorAll('.slide');
    
    if (!container) return; // 홈 페이지가 아닌 경우 종료
    
    let currentSlide = 0;
    
    // 초기 스크롤 위치를 0으로 설정
    container.scrollLeft = 0;
    
    // 스크롤 이벤트 처리 - 연속 스크롤용 (현재 보이는 이미지 감지)
    // Throttling을 사용하여 부드러운 업데이트
    let scrollTimeout = null;
    container.addEventListener('scroll', function() {
        // 기존 timeout 취소
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        
        // requestAnimationFrame으로 부드러운 업데이트
        scrollTimeout = requestAnimationFrame(function() {
            const scrollPosition = container.scrollLeft;
            const slideWidth = container.offsetWidth; // 각 슬라이드 너비 (100vw)
            
            // 현재 스크롤 위치를 기준으로 가장 가까운 슬라이드 계산
            const newSlide = Math.round(scrollPosition / slideWidth);
            
            // 슬라이드 범위 체크 및 인디케이터 업데이트
            if (newSlide >= 0 && newSlide < slides.length && newSlide !== currentSlide) {
                currentSlide = newSlide;
                updateIndicators();
            }
        });
    }, { passive: true });
    
    // 인디케이터 업데이트
    function updateIndicators() {
        indicators.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // 인디케이터 클릭 이벤트 - 부드럽게 해당 이미지로 이동
    indicators.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const slideWidth = container.offsetWidth;
            const targetPosition = slideWidth * index;
            
            container.scrollTo({
                left: targetPosition,
                behavior: 'smooth' // 부드러운 이동
            });
            
            // 인디케이터 즉시 업데이트
            currentSlide = index;
            updateIndicators();
        });
    });
    
    // 부드러운 스크롤 애니메이션 함수 - 일정한 속도로 스크롤
    let isScrolling = false;
    let scrollTarget = 0;
    let scrollVelocity = 0;
    let animationFrameId = null;
    
    function smoothScrollTo(target) {
        const currentScroll = container.scrollLeft;
        const distance = target - currentScroll;
        
        // 거리가 매우 작으면 즉시 이동
        if (Math.abs(distance) < 0.5) {
            container.scrollLeft = target;
            return;
        }
        
        // 일정한 속도로 스크롤 (픽셀/프레임)
        const scrollSpeed = 120; // 프레임당 이동 거리 (일정한 속도)
        scrollTarget = target;
        scrollVelocity = distance > 0 ? scrollSpeed : -scrollSpeed;
        
        if (!isScrolling) {
            isScrolling = true;
            animateScroll();
        }
    }
    
    function animateScroll() {
        const currentScroll = container.scrollLeft;
        const distance = scrollTarget - currentScroll;
        
        // 목표 지점에 도달했거나 거리가 매우 작으면 애니메이션 종료
        if (Math.abs(distance) < Math.abs(scrollVelocity)) {
            container.scrollLeft = scrollTarget;
            isScrolling = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            return;
        }
        
        // 일정한 속도로 이동
        const newScroll = currentScroll + scrollVelocity;
        container.scrollLeft = newScroll;
        animationFrameId = requestAnimationFrame(animateScroll);
    }
    
    // 마우스 휠 이벤트 (수평 스크롤) - 휠 입력에 즉시 반응
    container.addEventListener('wheel', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 기존 애니메이션 취소
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            isScrolling = false;
        }
        
        // 수직 스크롤을 수평 스크롤로 변환 (휠 입력만큼만 이동)
        const scrollAmount = e.deltaY * 4; // 휠 입력에 비례한 이동 (2배 빠르게)
        const currentScroll = container.scrollLeft;
        
        // 현재 위치에서 상대적으로 이동 (휠 입력만큼만)
        container.scrollLeft = currentScroll + scrollAmount;
    }, { passive: false });
    
    // 전체 페이지에서도 휠 이벤트 처리 (컨테이너 영역에서)
    document.addEventListener('wheel', function(e) {
        const container = document.querySelector('.horizontal-scroll-container');
        if (!container) return;
        
        // 컨테이너 영역인지 확인
        const rect = container.getBoundingClientRect();
        const isInContainer = e.clientX >= rect.left && e.clientX <= rect.right &&
                              e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        if (isInContainer && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            
            // 기존 애니메이션 취소
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                isScrolling = false;
            }
            
            const scrollAmount = e.deltaY * 2; // 휠 입력에 비례한 이동 (2배 빠르게)
            const currentScroll = container.scrollLeft;
            
            // 현재 위치에서 상대적으로 이동 (휠 입력만큼만)
            container.scrollLeft = currentScroll + scrollAmount;
        }
    }, { passive: false });
    
    // 키보드 화살표 키 지원
    container.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollToSlide(currentSlide + 1);
        }
    });
    
    // 컨테이너에 포커스 가능하도록 설정
    container.setAttribute('tabindex', '0');
    
    // 마우스 드래그 스크롤 지원
    let isDown = false;
    let startX;
    let scrollLeft;
    
    container.addEventListener('mousedown', function(e) {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', function() {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseup', function() {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        e.stopPropagation();
        
        // 기존 애니메이션 취소 (드래그 중에는 즉시 스크롤)
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            isScrolling = false;
        }
        
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절 (원래 속도로 복원)
        container.scrollLeft = scrollLeft - walk;
        
        // 드래그 중에도 인디케이터 업데이트
        const slideWidth = container.offsetWidth;
        const newSlide = Math.round(container.scrollLeft / slideWidth);
        if (newSlide >= 0 && newSlide < slides.length && newSlide !== currentSlide) {
            currentSlide = newSlide;
            updateIndicators();
        }
    });
    
    // 초기 커서 스타일
    container.style.cursor = 'grab';
    
    // 터치 이벤트 (모바일 지원)
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 왼쪽으로 스와이프 (다음 슬라이드)
                scrollToSlide(currentSlide + 1);
            } else {
                // 오른쪽으로 스와이프 (이전 슬라이드)
                scrollToSlide(currentSlide - 1);
            }
        }
    }
    
    function scrollToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= slides.length) {
            return;
        }
        
        const slideWidth = container.offsetWidth;
        const targetPosition = slideWidth * slideIndex;
        
        container.scrollTo({
            left: targetPosition,
            behavior: 'smooth' // 부드러운 이동
        });
        
        currentSlide = slideIndex;
        updateIndicators();
    }
    
    // 윈도우 리사이즈 시 현재 스크롤 비율 유지
    window.addEventListener('resize', function() {
        // 리사이즈 시에도 현재 보이는 이미지 유지
        const slideWidth = container.offsetWidth;
        const targetPosition = slideWidth * currentSlide;
        container.scrollLeft = targetPosition;
    });
    
    // 초기 인디케이터 설정
    updateIndicators();
});

