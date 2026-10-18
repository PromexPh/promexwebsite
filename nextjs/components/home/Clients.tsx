import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import styles from './Clients.module.css';

const allClients = [
  { name: 'Marriott International',  logo: '/images/Ads/Marriott-Logo.png'                  },
  { name: 'Hilton Worldwide',        logo: '/images/Ads/hilton-international.svg'            },
  { name: 'Sheraton Hotels',         logo: '/images/Ads/sheraton-hotels-resorts-logo.svg'    },
  { name: 'Kempinski Hotels',        logo: '/images/Ads/kempinski-hotels-logo.png'           },
  { name: 'Grand Millennium Hotels', logo: '/images/Ads/grand-millennium-hotels-logo.png'    },
  { name: 'Fairmont Hotels',         logo: '/images/Ads/fairmont-logo.png'                   },
  { name: 'Le Méridien',             logo: '/images/Ads/meridien-oran-logo.png'              },
  { name: 'Emirates Palace',         logo: '/images/Ads/emirates-palace-logo.png'            },
  { name: 'Fauchon Paris',           logo: '/images/Ads/fauchon-paris-logo.png'              },
  { name: 'Best Food',               logo: '/images/Ads/best-food-logo.jpeg'                 },
  { name: 'Hyundai',                 logo: '/images/Ads/hyundai-logo.png'                    },
  { name: 'Camacho Group',           logo: '/images/Ads/camacho-logo.png'                    },
];

// Duplicate for seamless infinite loop
const marqueeItems = [...allClients, ...allClients];

export default function Clients() {
  return (
    <section className={styles.clientsSection}>
      <div className="container">
        <Reveal animation="fade-up" delay={0}>
          <div className={styles.clientsHeader}>
            <span className={styles.sectionBadge}>Our Clients</span>
            <h2 className={styles.clientsHeading}>
              Trusted By Leading Organizations Worldwide
            </h2>
          </div>
        </Reveal>
      </div>

      {/* Marquee — full width, outside container */}
      <Reveal animation="fade-up" delay={120}>
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {marqueeItems.map((client, i) => (
              <div key={`${client.name}-${i}`} className={styles.clientCard}>
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  width={160}
                  height={80}
                  className={styles.clientLogo}
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
