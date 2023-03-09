export function ReloadPage({children}: {children: React.ReactNode}) {
    return <button onClick={() => window.location.reload()}>{children}</button>;
}
