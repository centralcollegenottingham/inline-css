'use strict';

var cheerio = require('cheerio'),
    tableStyleAttrMap = {
        table: {
            float: 'align',
            'background-color': 'bgcolor',
            width: 'width',
            height: 'height'
        },
        tr: {
            'background-color': 'bgcolor',
            'vertical-align': 'valign',
            'text-align': 'align'
        },
        'td,th': {
            'background-color': 'bgcolor',
            width: 'width',
            height: 'height',
            'vertical-align': 'valign',
            'text-align': 'align',
            'white-space': 'nowrap'
        },
        'tbody,thead,tfoot': {
            'vertical-align': 'valign',
            'text-align': 'align'
        }
    },
    applyStylesAsProps = function ($el, styleToAttrMap) {
        var style,
            styleVal;

        for (style in styleToAttrMap) {
            styleVal = $el.css(style);

            if (styleVal !== undefined) {
                // Strip px values from array to prevent width/height attributes being invalid
                $el.attr(styleToAttrMap[style], styleVal.replace('px', ''));
                // Keep CSS width/height properties but only when there not a percentage value
                if(styleToAttrMap[style] !== "width" && styleToAttrMap[style] !== "height" || styleVal.indexOf('%') > -1) {
                    $el.css(style, '');
                }
            }
        }
        // If empty style="" tags are left over remove them
        if ($el.attr('style') == '') { 
            $el.removeAttr('style'); 
        } 
    },
    batchApplyStylesAsProps = function ($el, sel, $) {
        $el.find(sel).each(function (i, childEl) {
            applyStylesAsProps($(childEl), tableStyleAttrMap[sel]);
        });
    };

cheerio.prototype.resetAttr = function (attribute) {
    if (!this.attr(attribute)) {
        this.attr(attribute, 0);
    }
    return this;
};

module.exports = function (el, $) {
    var selector,
        $el = $(el);

    $el = $el.resetAttr('border')
        .resetAttr('cellpadding')
        .resetAttr('cellspacing');

    for (selector in tableStyleAttrMap) {
        if (selector === 'table') {
            applyStylesAsProps($el, tableStyleAttrMap.table);
        } else {
            batchApplyStylesAsProps($el, selector, $);
        }
    }
};
