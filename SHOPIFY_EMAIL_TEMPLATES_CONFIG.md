# Configuração de Templates de Email do Shopify

Este guia mostra como configurar os templates de email do Shopify para apontar para seu front-end customizado.

## Templates que precisam ser configurados

### 1. Customer Account Invite (Convite de Conta do Cliente)

**Localização no Admin:** Settings > Notifications > Customer notifications > Customer account invite

**HTML Template - Substitua a URL do botão:**

```html
<!-- Encontre esta linha no template: -->
<a href="{{ customer.account_activation_url }}" class="btn">
  <!-- E substitua por: -->
  <a
    href="https://your-domain.com/account/activate?url={{ customer.account_activation_url | url_encode }}"
    class="btn"
  ></a
></a>
```

**Exemplo completo do botão:**

```html
<table
  role="presentation"
  border="0"
  cellpadding="0"
  cellspacing="0"
  class="btn btn-primary"
>
  <tbody>
    <tr>
      <td align="left">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td>
                <a
                  href="https://your-domain.com/account/activate?url={{ customer.account_activation_url | url_encode }}"
                  target="_blank"
                >
                  Activate Account
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
```

### 2. Customer Password Reset (Reset de Senha do Cliente)

**Localização no Admin:** Settings > Notifications > Customer notifications > Customer password reset

**HTML Template - Substitua a URL do botão:**

```html
<!-- Encontre esta linha no template: -->
<a href="{{ customer.reset_password_url }}" class="btn">
  <!-- E substitua por: -->
  <a
    href="https://your-domain.com/reset-password?url={{ customer.reset_password_url | url_encode }}"
    class="btn"
  ></a
></a>
```

## Passo a passo para configurar:

1. **Acesse o Shopify Admin**

   - Vá para Settings > Notifications

2. **Encontre o template Customer account invite**

   - Clique em "Customer account invite"
   - Clique em "Edit code"

3. **Modifique o HTML**

   - Encontre o botão de ativação
   - Substitua a URL conforme mostrado acima
   - Substitua `your-domain.com` pelo seu domínio real

4. **Teste o template**

   - Use a opção "Preview" para ver como ficará
   - Envie um email de teste se possível

5. **Repita para Customer password reset**
   - Encontre e edite o template de reset de senha
   - Faça as mesmas modificações

## URLs que sua aplicação deve interceptar:

- `/account/activate?url=SHOPIFY_ACTIVATION_URL`
- `/reset-password?url=SHOPIFY_RESET_URL`

## Importante:

- Os parâmetros `url` contêm as URLs originais do Shopify
- Sua aplicação deve extrair esses parâmetros e usá-los nas mutations
- As URLs do Shopify são temporárias e têm validade limitada
- Sempre use `url_encode` para garantir que os parâmetros sejam passados corretamente

## Exemplo de como sua aplicação deve processar:

```typescript
// Em /account/activate
const searchParams = useSearchParams();
const activationUrl = searchParams.get('url');

// Use activationUrl na mutation customerActivateByUrl
```
