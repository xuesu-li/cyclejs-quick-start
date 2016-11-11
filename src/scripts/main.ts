import {Observable} from 'rxjs';
import {SoAll, SiAll} from './typings';
import {run} from '@cycle/rxjs-run';
import {div, input, p, h2, h4, button, pre, code, hr, makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

function main({DOM}: SoAll): SiAll {
    const value$: Observable<string> =
        DOM.select('#input')
        .events('input')
        .map((e) => (<any> e.srcElement).value || '')
        .startWith('default');

    const count$: Observable<number> =
        DOM.select('#count')
        .events('click')
        .scan((acc: number) => acc + 1, 0)
        .startWith(0);

    const singleClick$: Observable<any> =
        DOM.select('#dblclick')
        .events('click');

    const clickCountInSecond$: Observable<number> =
        Observable.merge(
            singleClick$
            .delay(1000)
            .mapTo((_: number): number => 0),
            singleClick$
            .mapTo((acc: number) => acc + 1)
        )
        .scan((acc: number, value: (i: number) => number) => value(acc), 0);

    const doubleClick$: Observable<boolean> =
        clickCountInSecond$
        .map((n) => n >= 2)
        .startWith(false);

    return {
        DOM: Observable.combineLatest(
            value$,
            count$,
            doubleClick$
        ).map(([value, count, doubleClick]: [string, number, boolean]) =>
            div('.container', [
                div('.row', [
                    div('.col-xs-8.col-xs-offset-2', [
                        div('.panel.panel-default', [
                            div('.panel-heading', [
                                h2('.panel-title', 'cyclejs quick start')
                            ]),
                            div('.panel-body', [
                                h4('Data binding'),
                                div('.row', [
                                    div('.col-xs-6', [
                                        input('#input', {attrs: {type: 'text'}})
                                    ]),
                                    div('.col-xs-6', [
                                        pre([
                                            code([
                                                value || '💁'
                                            ])
                                        ])
                                    ])
                                ]),
                                hr(),
                                h4('Counter'),
                                div('.row', [
                                    div('.col-xs-6', [
                                        button('#count.btn.btn-default', ['👆'])
                                    ]),
                                    div('.col-xs-6', [
                                        pre([
                                            code([
                                                count + ''
                                            ])
                                        ])
                                    ])
                                ]),
                                hr(),
                                h4('Double click'),
                                div('.row', [
                                    div('.col-xs-6', [
                                        button('#dblclick.btn.btn-default', ['👏👏'])
                                    ]),
                                    div('.col-xs-6', [
                                        pre([
                                            code([
                                                doubleClick ? '🙆' : '🙅'
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        ),
        HTTP: Observable.never()
    };
}

run(main, {
    DOM: makeDOMDriver('#app-container'),
    HTTP: makeHTTPDriver()
});
