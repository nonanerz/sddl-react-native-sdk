Pod::Spec.new do |s|
  s.name          = "sddl-react-native-sdk"
  s.version       = "0.2.0"
  s.summary       = "SDDL React Native SDK"
  s.license       = { :type => "MIT" }
  s.authors       = { "SDDL" => "oss@sddl.me" }
  s.homepage      = "https://sddl.me"
  s.static_framework = true

  s.dependency "React-Core"
  s.swift_version = "5.0"
  s.source_files  = "ios/**/*.{h,m,mm,swift}"

  s.platforms     = { :ios => "12.0" }
  s.requires_arc  = true

  s.source        = { :path => "." }
  s.source_files  = "ios/**/*.{h,m,mm,swift}"
end
