import {Observable} from 'rxjs';
import {VNode} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {RequestInput} from '@cycle/http';
import {HTTPSource} from '@cycle/http/rxjs-typings';

export type SoDOM = {
    DOM: DOMSource
}

export type SiDOM = {
    DOM: Observable<VNode>
}

export type SoHTTP = {
    HTTP: HTTPSource
}

export type SiHTTP = {
    HTTP: Observable<RequestInput>
}

export type SoAll = SoDOM & SoHTTP
export type SiAll = SiDOM & SiHTTP
