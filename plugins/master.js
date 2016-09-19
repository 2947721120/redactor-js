$(function()
{
	if (window.devicePixelRatio >= 1.5)
	{
		var images = $("img.hires");
		for (var i = 0; i < images.length; i++)
		{
			var imageType = images[i].src.substr(-4);
			var imageName = images[i].src.substr(0, images[i].src.length - 4);
			imageName += "@2x" + imageType;
			images[i].src = imageName;
		}
	}

    if ($('#redactor-intro-box').size() !== 0)
    {
	    $('#redactor').redactor({
		    imageUpload: '/ajax/redactor/core/uploadImage/',
            fileUpload: '/ajax/redactor/core/uploadFile/',
            plugins: ['table', 'video']
        });
    }

	$('#invoice-form').on('success.callback.validate', function(data)
	{
		$('#invoice-form').html('<br><p class="text-centered"><a href="/download/redactor/payments/invoice:' + data.hash + '/" class="button big outline">Download Invoice</a>');
	});

	$('#invoice-form-old').on('success.callback.validate', function(data)
	{
		$('#invoice-form-old').html('<br><p class="text-centered"><a href="/download/redactor/payments/invoice:' + data.hash + '/" class="button big outline">Download Invoice</a>');
	});

    if ($('#redactor-buying').size() !== 0)
    {
    	var handler = StripeCheckout.configure({
    		key: 'pk_live_xW6mgWSvaebvB4Ah8Ta0VR65',
    		image: '/assets/img/stripe-128x128.png',
    		allowRememberMe: false,
    		locale: "auto",
    		alipay: "auto",
    		token: handleStripeToken
    	});

    	$('#modal-btn-pro').on('open.callback.modal', function()
    	{
        	var price = $('#price-pro').val();
    		setupModalEvent(this, handler, 'Professional license ($' + price + '.00)', price + '00', 102);
    		$.observer.once();
    	});


    }

});


function handleStripeToken(token, args)
{
	var $form = $("#payment-form");
	$form.find("input[name='stripeToken']").val(token.id);

	var data = $('#payment-form').serialize();

	$.progress.open();
	$('.modal-btn').attr('disabled', true);
	$('#modal-btn-pro').modal('close');

	$.ajax({
		url: '/ajax/redactor/payments/payment/',
		type: 'post',
		data: data,
		success: function(data)
		{
			$('.modal-btn').removeAttr('disabled');

			var json = $.parseJSON(data);
			if (json.type == 'location')
			{
				top.location.href = json.data;
			}
		}
	});

	return false;
}

function setupModalEvent(modal, handler, name, price, item)
{
	$('#plan-desc').val(name);
	$('#plan-price').val(price);
	$('#plan-item').val(item);

	$('#modal-btn-sign-in').on('open.callback.modal', function()
	{
		$('#modal-btn-pro').modal('close');
	});

	$('#payment-form').on('success.callback.validate', function()
	{
		modal.close();
		handler.open({
			name: 'Redactor',
			description: $('#plan-desc').val(),
			amount: $('#plan-price').val(),
			item: $('#stripe').val(),
			email: $('#user-email').val()
		});
	});
}