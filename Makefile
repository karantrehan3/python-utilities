# Unlock PDF
unlock-pdf:
	cd utilities/unlock-pdf && \
	docker-compose down && \
	docker-compose build && \
	docker-compose up