class FitFontsize {
    constructor (userOptions = {}) {
        const defaultOptions = {
            selector: '[fitfz]',
            delayExecute: 100
        };

        this.opts = {...defaultOptions, ...userOptions};
        this.Elements = document.querySelectorAll(this.opts.selector);

        // Escuchar evento de resize para ajustar fuentes
        window.addEventListener('resize', () => {
            this.eachElements();
        });

        this.eachElements();
    }

    // Metodo que sirve para pasar el elemento contedor y obtener el tamaño real en pixeles.
    getTrueWidth (Elem, arrOptions) {
        const elementComputedStyle = getComputedStyle(Elem);
        var realWidth = parseFloat(elementComputedStyle.width);

        arrOptions.forEach(value => { realWidth -= parseFloat(elementComputedStyle[value]); });

        return realWidth;
    }

    // Metodo que sirve para iterar sobre cada elemento al que se aplica el ajuste de tamaño de fuente y agregar
    // Este metodo agrega un retardo de ejecucion por si hay otros modulos de javascript que puedan afectar el tamaño final de los contenedores padre.
    eachElements () {
        this.Elements.forEach(elem => {
            const delayExecute = elem.hasAttribute('delay-execute') ? +elem.getAttribute('delay-execute') : this.opts.delayExecute;
            setTimeout(() => { this.beforeExecuteCore(elem); }, delayExecute);
        });
    }

    // Metodo para obtener el tamaño real del contenedor padre, aplicar algunas reglas CSS y llamar al core para que ajuste la fuente.
    beforeExecuteCore (elem) {
        const widthElement = this.getTrueWidth(elem, ['paddingLeft', 'paddingRight', 'marginLeft', 'marginRight', 'borderRightWidth', 'borderLeftWidth']);
            
        Array.from(elem.children).forEach(child => {
            child.style.cssText = 'display:table;';
            this.core(elem, child, widthElement);
        });
    }

    // Metodo que contiene el algoritmo que ajusta el tamaño de la fuente segun su contenedor padre.
    core (Parent, Elem, WidthParent) {
        const getReduce = Elem.getAttribute('data-reduce') || 0;
        const getMarginBottom = Elem.getAttribute('data-mbottom') || 0;
        const getLineHeight = Elem.getAttribute('data-line-height') || 0;
        const getLineHeightAll = Parent.getAttribute('data-line-height-all') || 0;
        const getMinFontSize = Parent.getAttribute('data-min-fz') || getComputedStyle(document.body).fontSize.replace('px', '');
        var spanWidth = Elem.clientWidth,
            spanHeight = Elem.clientHeight,
            currentFontSize = 1,
            offset = 10,
            prevSizeSpan = {w: 0, h: 0};

        while (spanWidth < WidthParent && currentFontSize < 200) {
            currentFontSize += ((spanWidth + offset) > WidthParent ? 0.1 : 1);
            
            Elem.style.fontSize = `${currentFontSize}px`;
            Elem.style.lineHeight = `${(currentFontSize + (+getLineHeightAll))}px`;

            prevSizeSpan.w = spanWidth;
            prevSizeSpan.h = spanHeight;
            spanWidth = Elem.clientWidth;
            spanHeight = Elem.clientHeight;

            
            if (spanHeight > (prevSizeSpan.h + offset) && currentFontSize > 3) {
                spanWidth = WidthParent;
                Elem.style.fontSize = currentFontSize - 1 + 'px';
            }
        }
        
        if (+getMinFontSize > currentFontSize) {
            Elem.style.fontSize = getMinFontSize + 'px';
            Elem.style.lineHeight = (parseInt(getMinFontSize) + parseInt(getLineHeightAll)) + 'px';
            currentFontSize = +getMinFontSize;
        }
        if (getReduce) {
            let getReduceInPx = currentFontSize - (+getReduce * 100/ currentFontSize);
            Elem.style.fontSize = `${getReduceInPx}px`;
            Elem.style.lineHeight = `${getReduceInPx}px`;
        }
        if (getLineHeight) {
            let addLineHeight = currentFontSize + (+getLineHeight);
            Elem.style.lineHeight = `${addLineHeight}px`;
        }
        if (getMarginBottom) {
            Elem.style.marginBottom = `${(+getMarginBottom)}px`;
        }
    }
}