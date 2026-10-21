function StatusMessage({ kind = 'loading', children }){
    return (
        <p className={`status-message is-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
            {children}
        </p>
    )
}

export default StatusMessage
