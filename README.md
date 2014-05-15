
# libhangul.js

## 소개

[libhangul.js](https://github.com/jangxyz/libhangul.js)는 오픈소스 라이브러리인 [libhangul](https://code.google.com/p/libhangul/)을 자바스크립트로 변환한 라이브러리입니다.

[emscripten](https://github.com/kripken/emscripten/wiki)을 이용하여 자동변환하였고, 그 위에 동일한 API를 씌웠습니다. 따라서 libhangul과 동일한 방식으로 같은 기능을 제공합니다.

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

- [libhangul API Reference Manual](http://libhangul.googlecode.com/git/doc/html/index.html)

