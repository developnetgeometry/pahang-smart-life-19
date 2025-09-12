import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface UserInvitationEmailProps {
  full_name: string
  email: string
  role: string
  invitation_url: string
  admin_name?: string
  temporary_password?: string
}

export const UserInvitationEmail = ({
  full_name,
  email,
  role,
  invitation_url,
  admin_name = 'Pentadbir',
  temporary_password,
}: UserInvitationEmailProps) => {
  const roleDisplayName = {
    'resident': 'Penduduk / Resident',
    'guest': 'Tetamu / Guest',
    'security_officer': 'Pegawai Keselamatan / Security Officer',
    'facility_manager': 'Pengurus Kemudahan / Facility Manager',
    'maintenance_staff': 'Kakitangan Penyelenggaraan / Maintenance Staff',
    'community_admin': 'Pentadbir Komuniti / Community Admin',
    'district_coordinator': 'Penyelaras Daerah / District Coordinator',
  }[role] || role;

  return (
    <Html lang="ms">
      <Head />
      <Preview>
        Anda telah dijemput menyertai Prima Pahang sebagai {roleDisplayName}. / 
        You have been invited to join Prima Pahang as {roleDisplayName}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>Jemputan Akaun / Account Invitation</Heading>
          
          <Section style={content}>
            {/* Malay Section */}
            <Heading style={title}>Selamat Datang ke Prima Pahang!</Heading>
            <Text style={greeting}>Assalamualaikum {full_name},</Text>
            <Text style={lead}>
              Anda telah dijemput untuk menyertai platform Prima Pahang sebagai <strong>{roleDisplayName}</strong>.
              {admin_name && ` Pentadbir ${admin_name} telah menghantar jemputan ini kepada anda.`}
            </Text>
            
            <Section style={buttonSection}>
              <Link href={invitation_url} style={button}>
                Terima Jemputan / Accept Invitation
              </Link>
            </Section>
            
            <Text style={linkText}>Atau salin & tampal pautan ini ke pelayar anda:</Text>
            <Text style={urlText}>
              <Link href={invitation_url} style={urlLink}>
                {invitation_url}
              </Link>
            </Text>
            
            {temporary_password && (
              <Text style={{...steps, marginBottom: '16px'}}>
                <strong>Maklumat Log Masuk / Login Information:</strong><br/>
                Email: {email}<br/>
                Kata laluan sementara / Temporary Password: <strong>{temporary_password}</strong>
              </Text>
            )}
            
            <Text style={steps}>
              <strong>Langkah seterusnya:</strong><br/>
              1. Klik pautan di atas<br/>
              2. Log masuk dengan email dan kata laluan sementara<br/>
              3. Lengkapkan maklumat profil anda<br/>
              4. Mula menggunakan platform
            </Text>

            <Hr style={divider} />

            {/* English Section */}
            <Heading style={{...title, marginTop: '0'}}>Welcome to Prima Pahang!</Heading>
            <Text style={greeting}>Hello {full_name},</Text>
            <Text style={lead}>
              You have been invited to join the Prima Pahang platform as <strong>{roleDisplayName}</strong>.
              {admin_name && ` Administrator ${admin_name} has sent this invitation to you.`}
            </Text>
            
            <Section style={buttonSection}>
              <Link href={invitation_url} style={button}>
                Accept Invitation
              </Link>
            </Section>
            
            <Text style={linkText}>Or copy and paste this link into your browser:</Text>
            <Text style={urlText}>
              <Link href={invitation_url} style={urlLink}>
                {invitation_url}
              </Link>
            </Text>
            
            {temporary_password && (
              <Text style={{...steps, marginBottom: '16px'}}>
                <strong>Login Information:</strong><br/>
                Email: {email}<br/>
                Temporary Password: <strong>{temporary_password}</strong>
              </Text>
            )}
            
            <Text style={steps}>
              <strong>Next steps:</strong><br/>
              1. Click the link above<br/>
              2. Login with your email and temporary password<br/>
              3. Complete your profile information<br/>
              4. Start using the platform
            </Text>

            <Text style={note}>
              Pautan ini sah untuk tempoh terhad. Jika anda tidak menjangkakan jemputan ini, sila hubungi pentadbir.<br/>
              This link is valid for a limited time. If you weren't expecting this invitation, please contact the administrator.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Perlu bantuan? Hubungi sokongan di{' '}
              <Link href="mailto:support@primapahang.com" style={footerLink}>
                support@primapahang.com
              </Link>
              <br/>
              Need help? Contact support at{' '}
              <Link href="mailto:support@primapahang.com" style={footerLink}>
                support@primapahang.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default UserInvitationEmail

// Styles
const main = {
  backgroundColor: '#f6f7fb',
  margin: '0',
  padding: '24px 0',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.06)',
}

const header = {
  padding: '24px 24px 0',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '1.2',
  color: '#111827',
  margin: '0',
}

const content = {
  padding: '20px 24px 24px',
}

const title = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const greeting = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px',
}

const lead = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 14px',
}

const buttonSection = {
  margin: '18px 0 16px',
  textAlign: 'center' as const,
}

const button = {
  display: 'inline-block',
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '12px 18px',
  borderRadius: '8px',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '14px',
}

const linkText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 6px',
}

const urlText = {
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  wordBreak: 'break-all' as const,
}

const urlLink = {
  color: '#059669',
  textDecoration: 'none',
}

const steps = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
}

const note = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '12px 0 0',
  lineHeight: '1.6',
}

const divider = {
  margin: '16px 0',
  borderColor: '#e5e7eb',
}

const footer = {
  padding: '12px 24px 24px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#6b7280',
  margin: '0',
}

const footerLink = {
  color: '#059669',
  textDecoration: 'none',
}