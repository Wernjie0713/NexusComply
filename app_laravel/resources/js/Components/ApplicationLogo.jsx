export default function ApplicationLogo(props) {
    // Use window.location.origin to ensure we get the full base URL
    const baseUrl = window.location.origin;
    
    return (
        <img
            src={`${baseUrl}/storage/images/Logo.png`}
            alt="NexusComply Logo"
            className="h-20 w-auto"
            {...props}
        />
    );
}
