const applications = {
  title: 'Uygulamalar',
  subtitle:
    'Kimlik doğrulaması için Logtoyu kullanmak üzere mobil, tek sayfa veya geleneksel bir uygulama ayarlayınız',
  create: 'Uygulama oluştur',
  application_name: 'Uygulama adı',
  application_name_placeholder: 'Uygulamam',
  application_description: 'Uygulama açıklaması',
  application_description_placeholder: 'Uygulama açıklaması giriniz',
  select_application_type: 'Uygulama tipi seçiniz',
  no_application_type_selected: 'Henüz bir uygulama tipi seçmediniz',
  application_created:
    '{{name}} Uygulaması başarıyla oluşturuldu! \nŞimdi uygulama ayarlarını tamamlayın.',
  app_id: 'Uygulama IDsi',
  type: {
    native: {
      title: 'Native Uygulama',
      subtitle: 'Nativede çalışan bir uygulama ',
      description: 'Örneğin, iOS uygulaması, Android uygulaması',
    },
    spa: {
      title: 'Tek sayfalı uygulama',
      subtitle:
        'Bir web tarayıcısında çalışan ve verileri yerinde dinamik olarak güncelleyen bir uygulama',
      description: 'Örneğin, React DOM uygulaması, Vue uygulaması',
    },
    traditional: {
      title: 'Traditional Web',
      subtitle: 'Sayfaları yalnızca web sunucusu tarafından işleyen ve güncelleyen bir uygulama',
      description: 'Örneğin, JSP, PHP',
    },
  },
  guide: {
    get_sample_file: 'Örnek Gör',
    header_description:
      'Uygulamanızı entegre etmek için adım adım kılavuzu izleyin veya örnek projemizi almak için sağ düğmeye tıklayınız',
    title: 'Uygulama başarıyla oluşturuldu',
    subtitle:
      'Şimdi uygulama ayarlarınızı tamamlamak için aşağıdaki adımları izleyiniz. Lütfen devam etmek için SDK türünü seçiniz.',
    description_by_sdk:
      'Bu hızlı başlangıç kılavuzu, Logtoyu {{sdk}} uygulamasına nasıl entegre edeceğinizi gösterir',
  },
};

export default applications;
