import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children, showLogo = false }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {showLogo ? (
            <div className="flex justify-center mb-4">
              <img
                src="src/assets/logoSena.png"
                alt="Logo SENA"
                className="w-24 h-24 object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
        <div className="mt-6 text-center text-xs text-muted-foreground/60 space-y-0.5">
          <p>Desarrollado por:</p>
          <p>Cesar Capacho · Michael Rey · Esteban Velandia</p>
          <p className="font-medium">ADSO 3065370</p>
        </div>
      </div>
    </div>
  );
}