import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="bg-[#fcf9f8] min-h-screen">
      <header className="px-4 h-[60px] flex items-center gap-3 border-b border-[#c3c8c1]/60 sticky top-0 bg-[#fcf9f8]/95 backdrop-blur-sm z-40">
        <Link href="/" className="flex items-center gap-2">
          <img src="/isotipo.svg" alt="PureMatch" width={28} height={28} className="rounded-full" />
          <span className="font-serif font-bold text-[#061b0e] text-[15px]">PureMatch</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 text-[#1b1c1c]">
        <h1 className="font-serif font-bold text-3xl text-[#061b0e] mb-2">Política de Privacidad</h1>
        <p className="text-[#737973] text-sm mb-8">Última actualización: mayo 2026</p>

        {[
          {
            title: '1. Datos que recopilamos',
            text: 'Recopilamos información que nos proporcionas directamente al crear una cuenta: nombre, correo electrónico, número de teléfono, RUT (opcional) y sector de residencia. También recopilamos información sobre tus perros: nombre, raza, edad, sexo, sector y fotografías. Los documentos de pedigree y salud se almacenan de forma segura para verificar los perfiles.',
          },
          {
            title: '2. Uso de los datos',
            text: 'Usamos tu información para operar la plataforma PureMatch: mostrar perfiles verificados, gestionar solicitudes de match, procesar desbloqueos de contacto y comunicarnos contigo sobre el estado de tus perfiles. No vendemos ni compartimos tus datos personales con terceros sin tu consentimiento.',
          },
          {
            title: '3. Almacenamiento y seguridad',
            text: 'Tus datos se almacenan en servidores seguros con cifrado SSL. Los documentos sensibles (pedigree, cartillas de vacunas) se almacenan en servidores en la nube con acceso restringido. Aplicamos medidas técnicas y organizativas para proteger tu información contra acceso no autorizado.',
          },
          {
            title: '4. Fotografías de mascotas',
            text: 'Las fotografías que subes de tus perros se almacenan en nuestra plataforma y pueden ser visibles para otros usuarios registrados en PureMatch. No utilizamos estas imágenes para fines publicitarios ni las compartimos fuera de la plataforma.',
          },
          {
            title: '5. Cookies',
            text: 'Utilizamos cookies de sesión para mantener tu acceso a la plataforma. No utilizamos cookies de seguimiento publicitario. Puedes desactivar las cookies en tu navegador, aunque esto puede afectar el funcionamiento de la plataforma.',
          },
          {
            title: '6. Tus derechos',
            text: 'Tienes derecho a acceder, rectificar o eliminar tus datos personales. Para ejercer estos derechos, contáctanos en privacidad@purematch.cl. Procesaremos tu solicitud dentro de los plazos establecidos por la Ley 19.628 sobre Protección de la Vida Privada.',
          },
          {
            title: '7. Contacto',
            text: 'Si tienes preguntas sobre esta política, escríbenos a privacidad@purematch.cl.',
          },
        ].map(({ title, text }) => (
          <section key={title} className="mb-7">
            <h2 className="font-serif font-semibold text-[#061b0e] text-lg mb-2">{title}</h2>
            <p className="text-[#737973] text-sm leading-relaxed">{text}</p>
          </section>
        ))}

        <div className="mt-10 pt-6 border-t border-[#e4e2e1]">
          <Link href="/terms" className="text-[11px] font-semibold text-[#061b0e] underline mr-6">Términos de Uso</Link>
          <Link href="/" className="text-[11px] font-semibold text-[#737973] underline">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
