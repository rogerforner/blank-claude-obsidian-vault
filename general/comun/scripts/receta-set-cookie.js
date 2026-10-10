async page => {
  const contexto = page.context();
  const paginaOrigen = new URL(page.url()).hostname;
  const pendientes = [];
  const alResponder = respuesta => {
    pendientes.push((async () => {
      const setCookie = await respuesta.headerValue('set-cookie');
      if (setCookie === null) return null;
      const url = respuesta.url();
      const origen = new URL(url).hostname === paginaOrigen ? 'primera' : 'tercera';
      return { url, origen, setCookie };
    })().catch(() => null));
  };
  contexto.on('response', alResponder);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForLoadState('networkidle');
  contexto.off('response', alResponder);
  const lista = await Promise.all(pendientes);
  return lista.filter(Boolean);
}
