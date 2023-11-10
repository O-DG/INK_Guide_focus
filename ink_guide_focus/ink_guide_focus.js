/**
 * INK function javascript
 * 마크업 단계에서 최대한의 작업을 하기 위한 라이브러리
 * 요소의 속성을 추가 적용하여 연결 명칭을 정의하는 방식으로 사용할 것.
 * 빠른 프로토타입 작업과 소규모 프로젝트를 수행하기에 적합.
 * 사용예시 ------------------------------------------------
 * <button i-guide="1" i-guide-title="도움말 - 제목" i-guide-text="도움말 내용"></button>
 * 
 * @version 1.0.0
 * @author INK
 * @since 2023.11
 * @copyright INK
 * @license This is open source
 */

// 관리자 사용법(가이드) - 각 페이지에 유동적으로 적용가능
function i_guide_focus() {

    let init_guide_arr = document.querySelectorAll('[i-guide]');
    let guide_arr = [];
    let guide_switch = true;

    // 동적 생성요소에 대한 중복 필터
    init_guide_arr.forEach(el => {
        filter_guide_duplicaion(guide_arr, el);
    });
    // 순서 재정렬
    guide_sort(guide_arr);
    // 가이드 활성화
    if (guide_switch && !getCookie('i_guide_focus')) {        // 임시적 쿠키로 적용함 > DB로 적용할 것을 권장
        // 클래스 추가(하이라이트 요소)
        guide_arr.forEach(el => {
            el.classList.add('i_guide_el');
        });

        // 하이라이트 요소가 있다면 순서대로 실행
        if (guide_arr.length > 0) {
            // 하이라이팅 현재 정보
            let current_info = guide_current_info(guide_arr);
            current_el = current_info.el;
            current_idx = current_info.idx;
                        
            // 하이라이트 요소가 없다면 종료
            if (!current_el) return;
            
            // 하이라이트 요소의 정보
            current_tit = current_el.getAttribute('i-guide-title')? current_el.getAttribute('i-guide-title') : null;
            current_cont = current_el.getAttribute('i-guide-text')? current_el.getAttribute('i-guide-text') : null;
            
            // 가이드 텍스트가 없다면 안내문과 함께 종료
            if(!current_cont) return alert('i-guide ' + current_el.getAttribute('i-guide') + '번 요소에 가이드 텍스트가 정의되어 있지 않습니다.\n가이드 요소에 텍스트 속성을 입력해주세요.\ni-guide-text="가이드 텍스트"');

            // 가이드 요소 하이라이팅
            current_el.classList.add('current');
            
            // 가이드 하이라이팅 모션 박스(포커스)
            const guide_focus_box =  document.createElement('div');
            guide_focus_box.classList.add('i_guide_focus_box');

            // 가이드 이벤트 방지(백그라운드)
            const guide_bg =  document.createElement('div');
            guide_bg.classList.add('i_guide_bg');
            // 가이드 텍스트 박스(레이어 창)
            const guide_wrap =  document.createElement('div');
            guide_wrap.classList.add('i_guide_wrap');
            // 가이드 타이틀 속성의 존재여부에 따라 출력
            guide_wrap.innerHTML = current_tit?  `<span class="guide_tit">${current_tit}</span>` : '';
            // 가이드 템플릿 적용
            guide_wrap.innerHTML += `
                <div class="guide_cont_wrap">
                    <p class="guide_cont">${current_cont}</p>
                </div>
                <div class="guide_btn_box">
                    <button class="guide_btn close_keep" type="button">더 이상 확인하지 않음</button>
                    <button class="guide_btn close" type="button" title="닫기"></button>
                    <button class="guide_btn prev disable" type="button" title="이전"></button>
                    <span class="guide_current_count">${current_idx + 1}<span class="split_per">/</span>${guide_arr.length}</span>
                    <button class="guide_btn next ${guide_arr.length <= 1? 'disable' : ''}" type="button" title="다음"></button>
                </div>
            `;
            // 가이드 베이스 생성
            document.body.appendChild(guide_bg);
            document.body.appendChild(guide_wrap);

            // 하이라이팅 클론 요소
            clone_highlighting(current_info);

            // 하이라이팅 포커스
            focus_highlighting(current_info);

            // 가이드 컨트롤러
            const guide_btn_close_keep = document.querySelector('.i_guide_wrap .guide_btn.close_keep');
            const guide_btn_close = document.querySelector('.i_guide_wrap .guide_btn.close');
            const guide_btn_prev = document.querySelector('.i_guide_wrap .guide_btn.prev');
            const guide_btn_next = document.querySelector('.i_guide_wrap .guide_btn.next');

            // 가이드 버튼 컨트롤러 이벤트
            guide_btn_close_keep.addEventListener('click', () => {      // 더 이상 확인하지 않음
                guide_close(guide_arr);
                // 추가로 가이드 스위칭 코드 추가해야 함
                // 임시 - 쿠키
                setCookie('i_guide_focus', 'Y', 1)
            });
            // 
            guide_btn_close.addEventListener('click', () => {           // 닫기
                guide_close(guide_arr);
            });
            guide_btn_prev.addEventListener('click', () => {            // 이전    
                // 비활성화 상태라면 이벤트 내용을 실행하지 않는다.
                if (guide_btn_prev.classList.contains('disable')) return;
                // 이전 가이드
                guide_highlighting('prev');

            });
            guide_btn_next.addEventListener('click', () => {            // 다음
                // 비활성화 상태라면 이벤트 내용을 실행하지 않는다.
                if (guide_btn_next.classList.contains('disable')) return;
                // 다음 가이드
                guide_highlighting('next');
            });

        }
    }


    // 쿠키 설정하기 expiredays = 1 = 하루 기준
    function setCookie(name, value, expiredays) {
        var todayDate = new Date();
        todayDate.setDate(todayDate.getDate() + expiredays);
        document.cookie = name + '=' + escape(value) + '; path=/; expires=' + todayDate.toGMTString() + ';';
    }
    
    // 쿠키 가져오기
    function getCookie(name) {
        var nameOfCookie = name + '=';
        var x = 0;
        while (x <= document.cookie.length) {
        var y = x + nameOfCookie.length;
        if (document.cookie.substring(x, y) == nameOfCookie) {
            if ((endOfCookie = document.cookie.indexOf(';', y)) == -1) endOfCookie = document.cookie.length;
            return unescape(document.cookie.substring(y, endOfCookie));
        }
        x = document.cookie.indexOf(' ', x) + 1;
        if (x == 0) break;
        }
        return '';
    }
  
    // 가이드 하이라이팅(이전/다음)
    function guide_highlighting(move = 'next'){
        // 가이드 컨트롤러
        const guide_focus_box = document.querySelector('.i_guide_focus_box');
        const guide_tit = document.querySelector('.i_guide_wrap .guide_tit');
        const guide_cont = document.querySelector('.i_guide_wrap .guide_cont');
        const guide_current_count = document.querySelector('.i_guide_wrap .guide_current_count');
        const guide_btn_prev = document.querySelector('.i_guide_wrap .guide_btn.prev');
        const guide_btn_next = document.querySelector('.i_guide_wrap .guide_btn.next');
        const guide_clones = document.querySelectorAll('.i_guide_clone');
        

        // 이전 클론 모두 삭제
        guide_clones.forEach(el => {
            el.remove();
        });

        // 하이라이팅 정보
        let return_info;
        // 하이라이팅 정보 구분
        switch (move) {
            case 'prev':
                return_info = check_highlighting(guide_arr, 'prev');    
                break;
            case 'next':
                return_info = check_highlighting(guide_arr, 'next');    
                break;
        }

        // 하이라이팅 정보 구분에 대한 대입
        return_el = return_info.el;
        return_idx = return_info.idx;

        // 하이라이팅 클론 요소
        clone_highlighting(return_info);

        // 가이드 텍스트가 없다면 안내문과 함께 종료
        if(!return_el.getAttribute('i-guide-text')) return alert('i-guide ' + return_el.getAttribute('i-guide') + '번 요소에 가이드 텍스트가 정의되어 있지 않습니다.\n가이드 요소에 텍스트 속성을 입력해주세요.\ni-guide-text="가이드 텍스트"');

        // 가이드 내용 적용
        guide_tit.innerHTML = return_el.getAttribute('i-guide-title')? return_el.getAttribute('i-guide-title') : null;
        guide_cont.innerHTML = return_el.getAttribute('i-guide-text')? return_el.getAttribute('i-guide-text') : null;
        guide_current_count.innerHTML = (return_idx + 1) + '<span>/</span>' + guide_arr.length;
        
        // 모든 하이라이팅 비활성화
        guide_arr.forEach(el => {
            el.classList.remove('current');
        });
        guide_focus_box.classList.remove('active');

        // 최종 하이라이팅 활성화
        return_el.classList.add('current');
        guide_focus_box.classList.add('active');

        // 모든 버튼 컨트롤러 활성화
        guide_btn_prev.classList.remove('disable');
        guide_btn_next.classList.remove('disable');

        // 버튼 컨트롤러 비활성화 구분
        switch (move) {
            case 'prev':  
                if(return_idx <= 0) guide_btn_prev.classList.add('disable');
                break;
            case 'next':
                if(return_idx >= guide_arr.length - 1) guide_btn_next.classList.add('disable');
                break;
            default:
                break;

        }
        
        // 하이라이팅 포커스
        focus_highlighting(return_info);

        // 하이라이팅 정보 반환
        return return_info;
    }

    // 하이라이팅 클론 요소
    function clone_highlighting(f_info){
        // 원본
        let real_el = f_info.el;
        // 클론 적용
        let clone_el = f_info.el.cloneNode(true);
        let el_rect = f_info.el? f_info.el.getBoundingClientRect() : null;
        clone_el.classList.add('i_guide_clone');
        
        // 요소의 배경 그대로 적용(없으면 흰색으로 자동정의)
        const clone_style_info_bg = window.getComputedStyle(real_el).getPropertyValue("background-color");
        let modifiedBgColor = clone_style_info_bg; // 프로퍼티를 그대로 수정할 수 없으므로 별도 변수를 만들어 대입 및 적용해야함
        // 구분할 수 없는 색상은 흰색으로 대체
        if (clone_style_info_bg === 'rgba(0, 0, 0, 0)' || clone_style_info_bg === 'rgba(255, 255, 255, 0)') modifiedBgColor = 'rgb(255, 255, 255)';
        // 반환된 클론 정보 및 좌표값 적용 - 하이라이팅 보더 값에 의해 (n)px * 2px 보정값 적용할 것
        clone_el.style.cssText = `width: calc(${el_rect.width}px + 2px); height: calc(${el_rect.height}px + 2px); left:${el_rect.left}px; top:${el_rect.top}px; background-color: ${modifiedBgColor}; margin:0;`;

        // 클론 생성(하이라이팅)
        document.body.appendChild(clone_el);
    }

    // 하이라이팅 포커스
    function focus_highlighting(f_info){
        // 초기화
        if(document.querySelector('.i_guide_focus_box')) document.querySelector('.i_guide_focus_box').remove();
        // 가이드 하이라이팅 모션 박스(포커스)
        const guide_focus_box =  document.createElement('div');
        guide_focus_box.classList.add('i_guide_focus_box');
        guide_focus_box.classList.add('active');
        document.body.appendChild(guide_focus_box);

        let el_rect = f_info.el? f_info.el.getBoundingClientRect() : null;
        
        // guide_focus_box.classList.remove('active');
        guide_focus_box.classList.add('active');
        guide_focus_box.style.cssText = `left:50%; top:50%`;
        
        // 인덱스(순서) 출력
        guide_focus_box.innerHTML = (f_info.idx + 1) == 0? '★': f_info.idx + 1;
        // 반환된 좌표값 적용
        let left_x = el_rect.left + (el_rect.width / 2);    // 클론 요소 중앙으로 배치하기 위한 계산식
        guide_focus_box.style.cssText = `left:${left_x}px; top:${el_rect.top}px;`;
    }
    
    // 하이라이트 요소 현재 정보
    function guide_current_info(arr){
        // 현재 하이라이팅 정보
        let current_info = check_highlighting(arr);

        // 하이라이팅 요소의 존재여부에 따라 해당 요소 반환
        if (!current_info.el){
            // 첫번째 요소를 선택(클래스 추가) 및 반환
            current_info.el = arr[0];
            current_info.idx = 0;
        }
        // 현재 정보 반환
        return current_info;
    }

    // 현재 하이라이팅 요소 확인
    function check_highlighting(arr, move = null){
        let check_info = {el: null, idx: 0};

        arr.forEach(el => {
            if (el.classList.contains('current')) {
                switch (move) {
                    case 'next':
                        check_info.el = arr[arr.indexOf(el) + 1 < arr.length? arr.indexOf(el) + 1 : arr.indexOf(el)];
                        check_info.idx = arr.indexOf(check_info.el);
                        break;
                
                    case 'prev':
                        check_info.el = arr[arr.indexOf(el) - 1 >= 0? arr.indexOf(el) - 1 : arr.indexOf(el)];
                        check_info.idx = arr.indexOf(check_info.el);
                        break;
                
                    default:
                        check_info.el = el;
                        check_info.idx = arr.indexOf(el);
                        break;
                }
                return check_info;
            }
        });
        return check_info;
    }

    // 중복 방지 필터링
    function filter_guide_duplicaion (arr, el) {
        // 중복 여부에 따라 해당 요소를 배열에 추가
        if (!arr.some(item => item.getAttribute('i-guide') === el.getAttribute('i-guide'))) {
            return arr.push(el);
        }
        return;
    }
    // 재정렬
    function guide_sort (arr) {
        // i-guide 속성에 입력한 숫자 순서대로 재정렬
        if (arr.length > 1) arr.sort(function(a, b) {
            var intA = parseInt(a.getAttribute('i-guide'));
            var intB = parseInt(b.getAttribute('i-guide'));
            return intA - intB;
        });
        return;
    }

    // 가이드 종료
    function guide_close(arr){
        // 가이드 요소 삭제
        document.querySelector('.i_guide_bg').remove();
        document.querySelector('.i_guide_focus_box').remove();
        document.querySelector('.i_guide_wrap').remove();
        document.querySelectorAll('.i_guide_clone').forEach(el => {
            el.remove();
        });
        // 가이드 요소 클래스 삭제
        arr.forEach(el => {
            el.classList.remove('current');
        });

    }
}
