
// "한글" -> [0xd55c, 0xae00, 0]
function ucscharPointer2IntegerArrayWithZeroPadding(ucschars) {
    var integerArray = [];

    var endPointer;

    hangul_syllable_iterator_next;
}
function ucschars2str(ucschars) {
    var sum = 0;
    for(var i = ucschars.length-1; i >= 0; i--) {
        sum = sum * 256 + ucschars[i].charCodeAt(0);
    }
    return String.fromCharCode(sum);
}



var hangul = {
    hangul_is_choseong:              function(ch) { return Module["ccall"]("hangul_is_choseong"             , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_jungseong:             function(ch) { return Module["ccall"]("hangul_is_jungseong"            , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_jongseong:             function(ch) { return Module["ccall"]("hangul_is_jongseong"            , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_choseong_conjoinable:  function(ch) { return Module["ccall"]("hangul_is_choseong_conjoinable" , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_jungseong_conjoinable: function(ch) { return Module["ccall"]("hangul_is_jungseong_conjoinable", "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_jongseong_conjoinable: function(ch) { return Module["ccall"]("hangul_is_jongseong_conjoinable", "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_syllable:              function(ch) { return Module["ccall"]("hangul_is_syllable"             , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_jamo:                  function(ch) { return Module["ccall"]("hangul_is_jamo"                 , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 
    hangul_is_cjamo:                 function(ch) { return Module["ccall"]("hangul_is_cjamo"                , "number", ["number"], [ch.charCodeAt(0)]) !== 0; }, 

    // ucschar hangul_jamo_to_cjamo(ucschar ch);
    hangul_jamo_to_cjamo: function(ch) { 
        return String.fromCharCode(Module["ccall"]("hangul_jamo_to_cjamo", "number", ["number"], [ch.charCodeAt(0)])); 
    },
    // ucschar hangul_jamo_to_syllable(ucschar choseong, ucschar jungseong, ucschar jongseong);
    hangul_jamo_to_syllable: function(choseong, jungseong, jongseong) {
        return String.fromCharCode(Module["ccall"]("hangul_jamo_to_syllable", "number", ["number", "number", "number"], [choseong.charCodeAt(0), jungseong.charCodeAt(0), jongseong.charCodeAt(0)])); 
    },

    // void hangul_syllable_to_jamo(ucschar syllable, ucschar* choseong, ucschar* jungseong, ucschar* jongseong);
    // int hangul_jamos_to_syllables(ucschar* dest, int destlen, const ucschar* src, int srclen);
    // const ucschar* hangul_syllable_iterator_prev(const ucschar* str, const ucschar* begin);
    // const ucschar* hangul_syllable_iterator_next(const ucschar* str, const ucschar* end);

    // int hangul_syllable_len(const ucschar* str, int max_len)
    //hangul_syllable_len: function(str, max_len) {
    //    return Module["ccall"]("hangul_syllable_len", "number", ["number", "number"], [str, max_len]);
    //},

    //
    // HangulInputcontext
    //

    //HangulInputContext* hangul_ic_new(const char* keyboard);
    hangul_ic_new: function(keyboard) {
        return Module["ccall"]("hangul_ic_new", "number", ["string"], [keyboard]);
    },
    //bool hangul_ic_process(HangulInputContext *hic, int ascii);
    hangul_ic_process: function(hic, ascii) {
        return Module["ccall"]("hangul_ic_process", "number", ["number", "number"], [hic, ascii]);
    },
    //void hangul_ic_delete(HangulInputContext *hic);
    hangul_ic_delete: function(hic) {
        Module["ccall"]("hangul_ic_new", "number", ["number"], [hic]);
    },
    //bool hangul_ic_backspace(HangulInputContext *hic);
    hangul_ic_backspace: function(hic) {
        Module["ccall"]("hangul_ic_backspace", "number", ["number"], [hic]);
    },
    //void hangul_ic_reset(HangulInputContext *hic);
    hangul_ic_reset: function(hic) {
        Module["ccall"]("hangul_ic_reset", "number", ["number"], [hic]);
    },

    //unsigned    hangul_ic_get_n_keyboards();
    hangul_ic_get_n_keyboards: function() {
        return Module["ccall"]("hangul_ic_get_n_keyboards", "number");
    },
    //const char* hangul_ic_get_keyboard_id(unsigned index_);
    hangul_ic_get_keyboard_id: function(index_) {
        return Module["ccall"]("hangul_ic_get_keyboard_id", "string", ["number"], [index_]);
    },
    //const char* hangul_ic_get_keyboard_name(unsigned index_);
    hangul_ic_get_keyboard_name: function(index_) {
        return Module["ccall"]("hangul_ic_get_keyboard_name", "string", ["number"], [index_]);
    },
    // void hangul_ic_select_keyboard(HangulInputContext *hic, const char* id);
    hangul_ic_select_keyboard: function(hic, id) {
        Module["ccall"]("hangul_ic_select_keyboard", "number", ["number", "string"], [hic, id]);
    },

    //bool hangul_ic_is_empty(HangulInputContext *hic);
    hangul_ic_is_empty:      function(hic) { return Module["ccall"]("hangul_ic_is_empty",      "number", ["number"], [hic]) !== 0; },
    //bool hangul_ic_has_choseong(HangulInputContext *hic);
    hangul_ic_has_choseong:  function(hic) { return Module["ccall"]("hangul_ic_has_choseong",  "number", ["number"], [hic]); },
    //bool hangul_ic_has_jungseong(HangulInputContext *hic);
    hangul_ic_has_jungseong: function(hic) { return Module["ccall"]("hangul_ic_has_jungseong", "number", ["number"], [hic]); },
    //bool hangul_ic_has_jongseong(HangulInputContext *hic);
    hangul_ic_has_jongseong: function(hic) { return Module["ccall"]("hangul_ic_has_jongseong", "number", ["number"], [hic]); },

    //const ucschar* hangul_ic_get_preedit_string(HangulInputContext *hic);
    hangul_ic_get_preedit_string: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_get_preedit_string", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },
    //const ucschar* hangul_ic_get_commit_string(HangulInputContext *hic);
    hangul_ic_get_commit_string: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_get_commit_string", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },
    //const ucschar* hangul_ic_flush(HangulInputContext *hic);
    hangul_ic_flush: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_flush", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },

};


// node
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module['exports'] = hangul;
}
// AMD
else if (typeof define === 'function' && define.amd) {
    define([], function() {
        return hangul;
    });
}
// browser
else {
    window['hangul'] = hangul;
}


})();
