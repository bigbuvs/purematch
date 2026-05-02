import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="bg-[#fcf9f8] min-h-screen">
      <header className="px-4 h-[60px] flex items-center gap-3 border-b border-[#c3c8c1]/60 sticky top-0 bg-[#fcf9f8]/95 backdrop-blur-sm z-40">
        <Link href="/" className="flex items-center gap-2">
          <img src="/isotipo.svg" alt="PureMatch" width={28} height={28} className="rounded-full" />
          <span className="font-serif font-bold text-[#061b0e] text-[15px]">PureMatch</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 text-[#1b1c1c]">
        <h1 className="font-serif font-bold text-3xl text-[#061b0e] mb-2">Términos de Uso</h1>
        <p className="text-[#737973] text-sm mb-8">Última actualización: mayo 2026</p>

        {[
          {
            title: '1. Aceptación de los términos',
            text: 'Al usar PureMatch aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma. Nos reservamos el derecho de actualizar estos términos con previo aviso a los usuarios registrados.',
          },
          {
            title: '2. Uso de la plataforma',
            text: 'PureMatch es una plataforma de conexión entre criadores y propietarios de perros de pedigree. Debes tener al menos 18 años para registrarte. Te comprometes a proporcionar información veraz sobre ti y tus perros. Está prohibido publicar perfiles falsos, usar la plataforma con fines fraudulentos o acosar a otros usuarios.',
          },
          {
            title: '3. Verificación de perfiles',
            text: 'Los perfiles "Verificado KCC" han pasado por una revisión de documentos por parte del equipo de PureMatch. La verificación no garantiza la exactitud de toda la información del perfil. PureMatch actúa como intermediario y no es responsable de las transacciones o acuerdos entre usuarios.',
          },
          {
            title: '4. Desbloqueo de contacto',
            text: 'El pago de $9.990 CLP por match desbloquea el acceso a los datos de contacto del otro usuario. Este pago es único, no genera cargos recurrentes y no es reembolsable una vez que el contacto ha sido revelado. El precio puede cambiar con previo aviso.',
          },
          {
            title: '5. Contenido del usuario',
            text: 'Eres responsable del contenido que publicas, incluyendo fotografías y documentos. Al subir contenido, nos concedes una licencia para mostrarlo dentro de la plataforma. No publicarás contenido que infrinja derechos de terceros, sea falso o dañino.',
          },
          {
            title: '6. Limitación de responsabilidad',
            text: 'PureMatch no garantiza resultados específicos de los matches. No somos responsables por daños indirectos derivados del uso de la plataforma. La plataforma se proporciona "tal cual" sin garantías de disponibilidad continua.',
          },
          {
            title: '7. Terminación',
            text: 'Podemos suspender o eliminar cuentas que violen estos términos sin previo aviso. Puedes cancelar tu cuenta en cualquier momento contactándonos en soporte@purematch.cl.',
          },
          {
            title: '8. Ley aplicable',
            text: 'Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será resuelta ante los tribunales competentes de Santiago, Chile.',
          },
        ].map(({ title, text }) => (
          <section key={title} className="mb-7">
            <h2 className="font-serif font-semibold text-[#061b0e] text-lg mb-2">{title}</h2>
            <p className="text-[#737973] text-sm leading-relaxed">{text}</p>
          </section>
        ))}

        <div className="mt-10 pt-6 border-t border-[#e4e2e1]">
          <Link href="/privacy" className="text-[11px] font-semibold text-[#061b0e] underline mr-6">Política de Privacidad</Link>
          <Link href="/" className="text-[11px] font-semibold text-[#737973] underline">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
