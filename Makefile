
SRC_DIR = libhangul/hangul
SRC = $(SRC_DIR)/hangulinputcontext.c $(SRC_DIR)/hangulctype.c

CONFIGURE = emconfigure
CC = emcc
DEFS = -DHAVE_CONFIG_H -DLOCALEDIR="/usr/local/share/locale" 
INCLUDE = -Ilibhangul -Ilibhangul/hangul
OPTIONS = -s EXPORTED_FUNCTIONS="['_hangul_is_choseong','_hangul_is_jungseong','_hangul_is_jongseong','_hangul_is_choseong_conjoinable','_hangul_is_jungseong_conjoinable','_hangul_is_jongseong_conjoinable','_hangul_is_syllable','_hangul_is_jamo','_hangul_is_cjamo','_hangul_jamo_to_cjamo','_hangul_jamo_to_syllable','_hangul_syllable_to_jamo','_hangul_syllable_len','_hangul_syllable_iterator_prev','_hangul_syllable_iterator_next','_hangul_jamos_to_syllables','_hangul_ic_process','_hangul_ic_get_preedit_string','_hangul_ic_get_commit_string','_hangul_ic_reset','_hangul_ic_flush','_hangul_ic_backspace','_hangul_ic_is_empty','_hangul_ic_has_choseong','_hangul_ic_has_jungseong','_hangul_ic_has_jongseong','_hangul_ic_select_keyboard','_hangul_ic_new','_hangul_ic_delete','_hangul_ic_is_transliteration','_hangul_ic_set_output_mode','_hangul_ic_set_keyboard','_hangul_ic_select_keyboard','_hangul_ic_set_combination','_hangul_ic_connect_callback','_hangul_ic_get_n_keyboards','_hangul_ic_get_keyboard_id','_hangul_ic_get_keyboard_name','_hangul_ic_get_preedit_string','_hangul_ic_get_commit_string','_hangul_ic_flush']"

UGLIFY=./node_modules/.bin/uglifyjs


hangul.js: libhangul $(SRC) src/pre.js src/post.js
	$(CC) $(SRC) \
		--pre-js  src/pre.js \
		--post-js src/post.js \
		-o hangul.js \
		$(INCLUDE) $(DEFS) $(OPTIONS)

hangul.min.js: libhangul $(SRC) src/pre.js src/post.js
	$(CC) $(SRC) \
		--pre-js  src/pre.js \
		--post-js src/post.js \
		-o hangul.O2.js \
		-O2 \
		$(INCLUDE) $(DEFS) $(OPTIONS)
	$(UGLIFY) hangul.O2.js -o hangul.min.js
	@rm -f hangul.O2.js


libhangul: libhangul/config.h

libhangul/config.h:
	cd libhangul && ./autogen.sh && $(CONFIGURE) configure --disable-nls


clean:
	cd libhangul && make clean && make distclean

