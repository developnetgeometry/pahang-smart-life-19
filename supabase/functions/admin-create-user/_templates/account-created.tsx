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

interface AccountCreatedEmailProps {
  full_name: string
  email: string
  role: string
  temporary_password?: string
  login_url: string
  admin_name?: string
}

export const AccountCreatedEmail = ({
  full_name,
  email,
  role,
  temporary_password,
  login_url,
  admin_name = 'Pentadbir',
}: AccountCreatedEmailProps) => {
  const roleDisplayName = {
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
        Akaun anda telah dibuat untuk Prima Pahang sebagai {roleDisplayName}. / 
        Your account has been created for Prima Pahang as {roleDisplayName}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>Akaun Baharu / New Account</Heading>
          
          <Section style={content}>
            {/* Malay Section */}
            <Heading style={title}>Akaun Anda Telah Dibuat!</Heading>
            <Text style={greeting}>Assalamualaikum {full_name},</Text>
            <Text style={lead}>
              Akaun anda untuk platform Prima Pahang telah berjaya dibuat sebagai <strong>{roleDisplayName}</strong>.
              {admin_name && ` Pentadbir ${admin_name} telah mencipta akaun ini untuk anda.`}
            </Text>
            
            <Section style={credentialsBox}>
              <Text style={credentialsTitle}>Maklumat Log Masuk / Login Details:</Text>
              <Text style={credentialItem}><strong>E-mel:</strong> {email}</Text>
              {temporary_password && (
                <Text style={credentialItem}><strong>Kata Laluan Sementara:</strong> {temporary_password}</Text>
              )}
            </Section>

            <Section style={buttonSection}>
              <Link href={login_url} style={button}>
                Log Masuk / Login Now
              </Link>
            </Section>
            
            <Text style={linkText}>Atau salin & tampal pautan ini ke pelayar anda:</Text>
            <Text style={urlText}>
              <Link href={login_url} style={urlLink}>
                {login_url}
              </Link>
            </Text>
            
            <Text style={important}>
              <strong>PENTING:</strong> Sila tukar kata laluan anda selepas log masuk pertama demi keselamatan akaun.
            </Text>

            <Hr style={divider} />

            {/* English Section */}
            <Heading style={{...title, marginTop: '0'}}>Your Account Has Been Created!</Heading>
            <Text style={greeting}>Hello {full_name},</Text>
            <Text style={lead}>
              Your account for the Prima Pahang platform has been successfully created as <strong>{roleDisplayName}</strong>.
              {admin_name && ` Administrator ${admin_name} has created this account for you.`}
            </Text>
            
            <Section style={credentialsBox}>
              <Text style={credentialsTitle}>Login Details:</Text>
              <Text style={credentialItem}><strong>Email:</strong> {email}</Text>
              {temporary_password && (
                <Text style={credentialItem}><strong>Temporary Password:</strong> {temporary_password}</Text>
              )}
            </Section>

            <Section style={buttonSection}>
              <Link href={login_url} style={button}>
                Login Now
              </Link>
            </Section>
            
            <Text style={linkText}>Or copy and paste this link into your browser:</Text>
            <Text style={urlText}>
              <Link href={login_url} style={urlLink}>
                {login_url}
              </Link>
            </Text>
            
            <Text style={important}>
              <strong>IMPORTANT:</strong> Please change your password after your first login for account security.
            </Text>

            <Text style={note}>
              Jika anda tidak menjangkakan akaun ini, sila hubungi pentadbir segera.<br/>
              If you weren't expecting this account, please contact the administrator immediately.
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

export default AccountCreatedEmail

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

const credentialsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const credentialsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
}

const credentialItem = {
  fontSize: '14px',
  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  color: '#374151',
  margin: '4px 0',
  lineHeight: '1.4',
}

const buttonSection = {
  margin: '18px 0 16px',
  textAlign: 'center' as const,
}

const button = {
  display: 'inline-block',
  backgroundColor: '#2563eb',
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
  color: '#2563eb',
  textDecoration: 'none',
}

const important = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#dc2626',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
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
  color: '#2563eb',
  textDecoration: 'none',
}