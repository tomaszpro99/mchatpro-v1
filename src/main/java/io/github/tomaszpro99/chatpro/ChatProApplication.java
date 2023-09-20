package io.github.tomaszpro99.chatpro;
import jakarta.validation.Validator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
@SpringBootApplication
public class ChatProApplication {
	public static void main(String[] args) {
		SpringApplication.run(ChatProApplication.class, args);
	}
	@Bean
	Validator validator() { return new LocalValidatorFactoryBean(); }
}