export default function Logo({ variant = 'full', className = '' }) {
  const src = variant === 'icon' ? '/smalllogo.png' : '/Logo.png'
  const alt = 'Ananta Robotics'

  return (
    <img
      src={src}
      alt={alt}
      className={`logo-img logo-img--${variant} ${className}`}
    />
  )
}
