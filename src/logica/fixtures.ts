import type { Caso, Distrito } from '../tipos'

export function caso(o: Partial<Caso> = {}): Caso {
  return {
    item: 1, ubigeo_inei: '010101', clave_provincia: 'AMAZONAS|CHACHAPOYAS', departamento: 'AMAZONAS',
    provincia: 'CHACHAPOYAS', distrito: 'CHACHAPOYAS', fecha: '2026-05-04', documento: 'PROVEIDO 1',
    canal: 'RENIEC', cat: 1, ciudadanos: null, observacion: 'obs', alerta: false, alerta_motivo: '',
    en_distrito_verificado: false, posterior_a_resolucion: false, localidad_original: '', ...o,
  }
}

export function distrito(o: Partial<Distrito> = {}): Distrito {
  return {
    ubigeo_inei: '010101', departamento: 'AMAZONAS', provincia: 'CHACHAPOYAS', distrito: 'CHACHAPOYAS',
    clave_provincia: 'AMAZONAS|CHACHAPOYAS', lon: -77.8, lat: -6.2, bbox: [-78, -6.4, -77.6, -6.0],
    denuncias: 0, ciudadanos: null, verificacion: null, restituidos: null, ...o,
  }
}

export const VERIFICACION = {
  tipo: 'resolucion' as const, resolucion: '000046-2026/DRE/SDPEG/RENIEC', publicada: '2026-04-10',
  domicilios: 1667, A: 1147, B: 325, C: 19, url: 'https://cdn.www.gob.pe/x.pdf',
}
