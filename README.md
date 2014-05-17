
# libhangul.js

## 소개

[libhangul.js](https://github.com/jangxyz/libhangul.js)는 오픈소스 라이브러리인 [libhangul](https://code.google.com/p/libhangul/)을 자바스크립트로 변환한 라이브러리입니다.

[emscripten](https://github.com/kripken/emscripten/wiki) 툴을 이용하여 변환하였고, 그 위에 동일한 API를 씌웠습니다. 따라서 libhangul과 동일한 방식으로 같은 기능을 제공합니다.

	libhangul은 다음과 같은 기능을 제공합니다.

	- 한글 입력기의 기본 동작을 구현한 코드를 제공합니다. libhangul의 [HangulInputContext](http://libhangul.googlecode.com/git/doc/html/group__hangulic.html#hangulicusage)를 이용하면 한글 조합 루틴을 별도로 작성하지 않아도 한글 입력 기능을 손쉽게 구현할 수 있습니다.
	- 한자 사전 파일과 검색 루틴을 제공합니다. 한글 입력기에서 한자 변환에 필요한 데이터를 한자 사전 파일 형태로 제공하고, 그 파일에서 원하는 한자를 쉽게 찾아볼 수 있는 함수를 제공합니다.
	- 몇가지 간단한 유니코드 한글 처리 루틴을 제공합니다.

현재는 다국어지원(NLS)과 한자 기능은 지원하지 않습니다.


## 빌드 방법

먼저 libhangul을 설정한 후, emconfigure과 emcc를 이용해서 빌드합니다.

1. libhangul 받기

	git submodule init
	git submodule update

2. libhangul 설정하기

	cd libhangul
	./autogen
	emconfigure ./configure --disable-nls

3. hangul.js 빌드

	make hangul.js
	make hangul.min.js
	

## API Reference

	/* 한글 글자 조작 함수 */
	function hangul_is_choseong(c): 초성인지 확인하는 함수 
	function hangul_is_jungseong(c): 중성인지 확인하는 함수 
	function hangul_is_jongseong(c): 종성인지 확인하는 함수 
	function hangul_is_choseong_conjoinable(c): 초성이고 조합 가능한지 확인 
	function hangul_is_jungseong_conjoinable(c): 중성이고 조합 가능한지 확인 
	function hangul_is_jongseong_conjoinable(c): 종성이고 조합 가능한지 확인 
	function hangul_is_syllable(c): 한글 음절 인지 확인
	function hangul_is_jamo(c): 자모 인지 확인 
	function hangul_is_cjamo(c): 호환 자모인지 확인 
	function hangul_jamo_to_cjamo(c): 자모 코드를 대응하는 호환 자모로 변환 
	function hangul_jamo_to_syllable(choseong, jungseong, jongseong): 자모 코드를 조합하여 한글 음절로 변환 

	/* 한글 입력 기능 함수 */
	function hangul_ic_process(hic, ascii): 키 입력을 처리하여 실제로 한글 조합을 하는 함수 
	function hangul_ic_get_preedit_string(hic): 현재 상태의 preedit string을 구하는 함수 
	function hangul_ic_get_commit_string(hic): 현재 상태의 commit string을 구하는 함수 
	function hangul_ic_reset(hic): HangulInputContext 를 초기상태로 되돌리는 함수 
	function hangul_ic_flush(hic): HangulInputContext 의 입력 상태를 완료하는 함수 
	function hangul_ic_backspace(hic): HangulInputContext 가 backspace 키를 처리하도록 하는 함수 
	function hangul_ic_is_empty(hic): HangulInputContext 가 조합중인 글자를 가지고 있는지 확인하는 함수 
	function hangul_ic_has_choseong(hic): HangulInputContext 가 조합중인 초성을 가지고 있는지 확인하는 함수 
	function hangul_ic_has_jungseong(hic): HangulInputContext 가 조합중인 중성을 가지고 있는지 확인하는 함수 
	function hangul_ic_has_jongseong(hic): HangulInputContext 가 조합중인 종성을 가지고 있는지 확인하는 함수 
	function hangul_ic_select_keyboard(hic, id): HangulInputContext 의 자판 배열을 바꾸는 함수 
	function hangul_ic_new(keyboard): HangulInputContext 오브젝트를 생성한다. 
	function hangul_ic_delete(hic): HangulInputContext 를 삭제하는 함수 


더 자세한 내용은 [libhangul API 문서](http://libhangul.googlecode.com/git/doc/html/index.html)를 참고하세요.

## Example


	> var h = hangul;

	// 자음 기억(0x3131)
	> var kiyeok1 = 'ㄱ';    // String.fromCharCode(0x3131);
	> h.hangul_is_choseong(kiyeok1);
	false
	> h.hangul_is_jamo(kiyeok1);
	false
	> h.hangul_is_cjamo(kiyeok1);
	true

	// 초성기억(0x1100)
	> var kiyeok2 = String.fromCharCode(0x1100);
	> h.hangul_is_choseong(kiyeok2);
	true
	> h.hangul_is_jamo(kiyeok2);
	true
	> h.hangul_is_cjamo(kiyeok2);
	false
	> h.hangul_jamo_to_cjamo(kiyeok2) === kiyeok1;
	true

	> h.hangul_jamo_to_syllable(String.fromCharCode(0x1100), String.fromCharCode(0x1173), String.fromCharCode(0x11af));
	'글'


